const NRP = require("node-redis-pubsub"); // TODO: Replace with UDP (client and server in one (loopback)); test pubsub with file descriptors (remove all dependencies and use node-redis-pubsub as an plugin/extension)
const uuid = require("uuid");

// TODO: Define configuration execution profiles (default is greedy, so emits to all listeners, not just one with Promise.race or workers, for example). Profile wasted computation to optimize (i.e., redundant computation that's not used due to lost race) ; test with current implementation using "unsubscribe" to block context resolution

// TODO: Create default configuration generator that uses default credentials/configs to try
const nrp = new NRP({
  port: 6379, // Port of your remote Redis server
  host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
  // auth: 'password'                  , // Password
  scope: "gesso" // Use a scope to prevent two NRPs from sharing messages
}); // This is the NRP client

const __functions__ = {};

const __observers__ = {};

const __queue__ = {};

const __context__ = {};

// <MOVE_INTO_IMPORTABLE_LIBRARIES_FOR_FUNCTION>
const __cache__ = {};
const __database__ = {};
// </MOVE_INTO_IMPORTABLE_LIBRARIES_FOR_FUNCTION>

// TODO: Test without .gessoginroe
// TODO: Test with empty function path
// TODO: Test with malformed manifest.json
// TODO: Test with version mismatch (i.e., don't exclude version)
// TODO: Test with version match (i.e., exclude version)

// TODO: Create minimal cross-platform interactive UI framework to get input, print message, show image, wait to submit drawing, ... ; demo: implement chat / announcement / sound synchronize using feedback and genetic algorithms to optimize / voice input -> voice output

// TODO: Extend to include discover/profile inputs from network, etc.
// TODO: Extend "index"/"prepare"/"discover"/"profile" to gather system info (info from: https://nodejs.org/api/os.html), OS, CPUs/threads, language interpreters, whether Docker is installed, etc.
const fs = require("fs");
const prepare = () => {
  const fdirs = fs
    .readdirSync("./functions", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  console.log("fdirs:");
  console.log(fdirs);

  // Get function names (ignore in .gessoignore) as use as `fnames`.
  console.log("fignore:");
  const fignore = require(`./.gessoignore.json`);
  console.log(fignore);

  const fnames = [];
  for (const fdir of fdirs) {
    const fname = fdir;
    try {
      console.log(fignore[fname]);
      const fmodule = require(`./functions/${fname}`);
      const fmanifest = fmodule.manifest;
      if (fignore && fignore[fname] && fignore[fname] !== fmmanifest.version) {
        continue;
      }
      console.log(fmanifest);
      fnames.push(fname)
    } catch (err) {
      continue;
    }
  }

  return {
    fnames,
    hpeers: [] // host peers, discovered on network on "gesso:announce:*" (and after handshake, any auth configured (JWT))
  };
};

// Register functions (if there's a .gesso file else ~/.gesso). (v2.0.0)
const register = () => {
  const { fnames, fhosts } = prepare();
  console.log("fnames:");
  console.log(fnames);
  console.log("fhosts:");
  console.log(fhosts); // print their fnames as well

  // Import and register functions.
  // const fnames = ["random-number", "random-word", "echo"];
  for (const fname of fnames) {
    // try {
    const fmodule = require(`./functions/${fname}`);
    const fmanifest = fmodule.manifest;
    __functions__[fmanifest.id] = fmodule;
    // __functions__[manifest.id] = new functionModule.Function(); // Singleton/server/daemon (option on import)
    // } catch (err) {
    //   continue;
    // }
  }

  // Store references to function observers.
  for (const fid of Object.keys(__functions__)) {
    __observers__[fid] = [];
  }

  // <REGISTER_OBSERVERS>
  // TODO: Read from manifest and watch for changes or lazy load as needed (option). Version each function automatically as a Git repo (in manifest, store version => commit map)
  // __observers__["87f61a956fcc457197f5e2a3e49dad73"] = [
  //   "444e1e5ad06f448bb01d990db2f6b1c4"
  // ];
  // __observers__["a765bfe31dc043b6bb4c8a0cded2487a"] = [
  //   "444e1e5ad06f448bb01d990db2f6b1c4"
  // ];
  for (const fname of fnames) {
    const functionModule = require(`./functions/${fname}`);
    const manifest = functionModule.manifest;
    if (manifest["observers"]) {
      __observers__[manifest.id] = Object.keys(manifest.observers);
      // __functions__[manifest.id] = new functionModule.Function(); // Singleton/server/daemon (option on import)
    }
  }
  // </REGISTER_OBSERVERS>
};

// ----------------------------------------------------------------------------
//
// Runtime.
//
// ----------------------------------------------------------------------------

const initialize = () => {
  register();

  // Connect to queues.
  for (const fn of Object.keys(__functions__)) {
    if (!__queue__[fn]) {
      __queue__[fn] = [];
    }
    // __queue__[fn].push({
    //   name: 0
    // });
  }

  // Enable functions.
  for (const fid of Object.keys(__functions__)) {
    connect(fid);
  }
};

// Connect function to queue so it's available.
// TODO: Add fifo option (block and await confirmation of context resolution)
const connect = fid => {
  // TODO: FIFO queue or immediate. If blocking on FOFO, network to spawn new immediate or another queue (ephemeral)
  nrp.on(`gesso:function:${fid}`, execute(fid));
};

const execute = fid => {
  return async message => {
    // TODO: Load and cache function from disk or repository if needed. Release
    //   from cache after a timeout. Learn timing to precache function based
    //   on timing and patterns. Genetic algorithm?

    // TODO: Use workers here!

    // Execute function (block on output, so put this in its own thread, if possible).
    const fn = __functions__[fid];
    // const output = await fn.execute(message.input); // For singleton/server/daemon function
    const output = await new fn.Function().execute(message.input);

    // Send output on reply queue so promise can resolve.
    const channel = `gesso:function:${message.source}:${message.correlationId}`;
    nrp.emit(channel, {
      correlationId: null,
      source: fid,
      output
    });

    // Dispatch output to observers, if any.
    dispatch(fid, output);

    // Return?
    return output;
  };
};

const dispatch = async (fid, input) => {
  console.log("dispatch");
  // TODO: "deep" option to await observer output with Promise.all.
  for (const oid of __observers__[fid]) {
    emit(oid, input);
  }
};

// TODO: option to await respones from subscribers as well (deep call, tree call); return when there are no more subscribers (don't allow circular?)
// TODO: correlation id => promise to await via pubsub
const emit = async (fid, input) => {
  console.log("enqueue");

  const correlationId = uuid.v4();

  const context = {
    startTime: Date.now()
  };

  // TODO: Promise.race to share Redis.
  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __context__[correlationId] = context;

  // Send input and await function output.
  const channel = `gesso:function:${fid}:${correlationId}`;
  const unsubscribe = nrp.on(channel, output => {
    const duration = Date.now() - context.startTime;
    console.log(`duration: ${duration}`);
    const hasResponse = unsubscribe(() => {
      console.log(`Unsubscribe ${channel}`);
    });
    console.log(`hasResponse: ${hasResponse}`);
    delete __context__[correlationId];
    context.resolve(output);
  });

  // Emit function invocation.
  const message = {
    correlationId,
    source: fid,
    input
  };
  nrp.emit(`gesso:function:${fid}`, message);

  return promise;
};

// ----------------------------------------------------------------------------
//
//  REPL.
//
// ----------------------------------------------------------------------------

// TODO: class REPL
const startREPL = process => {
  const { argv } = process;

  initialize();

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

  // TODO: Add middleware to create async generators that queue inputs on a schedule (for testing and fun).

  stdin.addListener("data", async data => {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    console.log(data.toString().trim());
    for await (const fid of Object.keys(__functions__)) {
      if (fid === "444e1e5ad06f448bb01d990db2f6b1c4") {
        continue;
      }
      // Wait until message confirmation then return for async calls.
      // for await (const input of __queue__[fid]) {
      const input = parseInput(data);
      // const processedInput// TODO: Apply middleware.
      const output = await emit(fid, input);
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
};

// Use interactively.
if (require.main === module) {
  if (process.argv) {
    // execute(process.argv)
    startREPL(process);
  }
}

// ----------------------------------------------------------------------------
//
//  Node module.
//
// ----------------------------------------------------------------------------

// Allows importing as a module to invoke programmatically or extend Gesso (framework/SDK module).
// TODO: module.exports.Gesso = Gesso;
module.exports.initialize = initialize;

// TODO: Add CLI option (middleware) to generate new function, add observers, .gessoignore function to ingore functions, store app/session manifests in ~/.gesso
// TODO: Add option to include as module
// TODO: Add option to pipe in input and pipe out output (await and stream output on stdout, then quit)
// TODO: Add option to start HTTP server and auto-host all non-ignored functions (else 405) and generate hosted Swagger spec (and export as YAML for application)
// TODO: p2p UDP communication and automatic checkout/viral host propagation (just start gesso then it will load and distrubte execution, just needs Redis or a distributed in-memory execution (default))... deploys automatically with Gesso Dockerfile for live programming and execution (allocates based on resources)
// TODO: Add option to run as discrete simulation (uses step functions)
// TODO: Svelte to generate UI automatically with drag and drop composition (keep it tight) with Svelte compiler.
// TODO: Add standard modules (audio, video, image, io, arduino, etc.)
// TODO: Add a function type to create a worker queue that leverages Node threading. Couple with a "singleton host" function type that serves only a single function. Exposing on a network works well (autoassemble based on stated requirements (GPU, CPU, threads desired, etc. determined by host from system info))
// TODO: Write up RFC for Gesso and use the spec in it to implement in Python, C, etc. (these should interoperate and all report host system info so Gesso can distribute computation intelligently and use IASM, leverage one language/runtime when it's appropriate (e.g., Node for webserver, Python for ML/TensorFlow, MCU for digital I/O, computer with good speakers for sound, etc.))
