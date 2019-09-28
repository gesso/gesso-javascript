const NRP = require("node-redis-pubsub");
const uuid = require("uuid");
// const { job, start: startPool, stop } = require("microjob");

const config = {
  port: 6379, // Port of your remote Redis server
  host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
  // auth: 'password'                  , // Password
  scope: "gesso" // Use a scope to prevent two NRPs from sharing messages
};

const nrp = new NRP(config); // This is the NRP client

const __functions__ = {};

const initializeFunctions = () => {
  const fnames = ["random-number", "random-word"];
  for (const fname of fnames) {
    const functionModule = require(`./functions/${fname}`);
    const manifest = functionModule.manifest;
    __functions__[manifest.id] = new functionModule.Function();
  }
};
initializeFunctions();

const __observers__ = {
  // "87f61a956fcc457197f5e2a3e49dad73": [],
  // f978c61bf29549d8840fbb0e1d0743e8: [
  //   // "f978c61bf29549d8840fbb0e1d0743e8", // Recursion.
  //   "a765bfe31dc043b6bb4c8a0cded2487a",
  //   "444e1e5ad06f448bb01d990db2f6b1c4"
  // ],
  // a765bfe31dc043b6bb4c8a0cded2487a: [],
  // "444e1e5ad06f448bb01d990db2f6b1c4": [
  //   // "87f61a956fcc457197f5e2a3e49dad73",
  //   // "f978c61bf29549d8840fbb0e1d0743e8" // Circuit.
  // ],
  // "2ad0bf752ae24815b61874eddaae6d33": ["444e1e5ad06f448bb01d990db2f6b1c4"]
};
for (const fid of Object.keys(__functions__)) {
  __observers__[fid] = [];
}
// for (const fid of Object.keys(__functions__)) {
//   __observers__[fid] = Object.keys(__functions__);
// }

const __queue__ = {};
const __promiseQueue__ = {};

const __cache__ = {};

const __database__ = {};
// call function

// TODO: option to await respones from subscribers as well (deep call, tree call); return when there are no more subscribers (don't allow circular?)
// TODO: correlation id => promise to await via pubsub
const enqueue = async (fid, input) => {
  console.log("enqueue");

  // if (input) {
  const correlationId = uuid.v4();

  const context = {
    startTime: Date.now()
  };

  // TODO: Promise.race to share Redis.
  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __promiseQueue__[correlationId] = context;

  // Send input and await function output.
  const channel = `gesso:function:${fid}:${correlationId}`;
  const unsubscribe = nrp.on(channel, output => {
    const duration = Date.now() - context.startTime;
    console.log(`duration: ${duration}`);
    const hasResponse = unsubscribe(() => {
      console.log(`Unsubscribe ${channel}`);
    });
    console.log(`hasResponse: ${hasResponse}`);
    delete __promiseQueue__[correlationId];
    context.resolve(output);
  });

  // Emit function invocation.
  const message = {
    correlationId,
    source: fid,
    input
  };
  nrp.emit(`gesso:function:${fid}`, message);
  // }

  return promise;
};

const dispatch = async (fid, input) => {
  console.log("dispatch");
  for (const oid of __observers__[fid]) {
    enqueue(oid, input);
  }
};

// ----------------------------------------------------------------------------
//
// Execution strategy 2.
//
// ----------------------------------------------------------------------------

// Connect function to queue so it's available.
const expose = fid => {
  nrp.on(`gesso:function:${fid}`, async message => {
    // TODO: Load and cache function from disk or repository if needed. Release
    //   from cache after a timeout. Learn timing to precache function based
    //   on timing and patterns. Genetic algorithm?

    // TODO: Use workers here!

    // Execute function (block on output, so put this in its own thread, if possible).
    const fn = __functions__[fid];
    const output = await fn.execute(message.input);

    // Dispatch output to observers, if any.
    dispatch(fid, output);

    // Send output on reply queue so promise can resolve.
    const channel = `gesso:function:${message.source}:${message.correlationId}`;
    nrp.emit(channel, {
      correlationId: null,
      source: fid,
      output
    });

    // Return?
    return output;
  });
};

const start = () => {
  // Initialize queues.
  for (const fn of Object.keys(__functions__)) {
    if (!__queue__[fn]) {
      __queue__[fn] = [];
    }
    __queue__[fn].push({
      name: 0
    });
  }

  // Enable functions.
  for (const fid of Object.keys(__functions__)) {
    expose(fid);
  }
};

start();

const stdin = process.openStdin();
process.stdout.write("$ ");

const parseInput = input => {
  return input;
};

const middleware = input => {
  // Parse input and queue commands, then continue to next middleware.
  const output = input; // Define middleware to process input and define commands and syntax.
  return output;
};

stdin.addListener("data", async data => {
  // note:  d is an object, and when converted to a string it will
  // end with a linefeed.  so we (rather crudely) account for that
  // with toString() and then trim()
  console.log(data.toString().trim());
  for await (const fid of Object.keys(__functions__)) {
    // Wait until message confirmation then return for async calls.
    // for await (const input of __queue__[fid]) {
    const input = parseInput(data);
    // const processedInput// TODO: Apply middleware.
    const output = await enqueue(fid, input);
    console.log(`final:`);
    console.log(output);
    // }
  }
  process.stdout.write("$ ");
});

process.on("SIGINT", function() {
  console.log("Got SIGINT.  Going to exit.");
  // Safely (connections will be closed properly once all commands are sent)
  nrp.quit();
  // Dangerously (connections will be immediately terminated)
  // nrp.end();
  // Your code to execute before process kill.
  process.kill(process.pid);
});
