const NRP = require("node-redis-pubsub");
const { job, start: startPool, stop } = require("microjob");

const config = {
  port: 6379, // Port of your remote Redis server
  host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
  // auth: 'password'                  , // Password
  scope: "demo" // Use a scope to prevent two NRPs from sharing messages
};

const nrp = new NRP(config); // This is the NRP client

const __functions__ = {
  "87f61a95-6fcc-4571-97f5-e2a3e49dad73": {
    execute: input => {
      console.log("Received input:");
      console.log(input);
      return { name: input.name + 1 };
    }
  },
  "f978c61b-f295-49d8-840f-bb0e1d0743e8": {
    execute: input => {
      console.log("Received input:");
      console.log(input);
      return { name: input.name + 1 };
    }
  },
  "a765bfe3-1dc0-43b6-bb4c-8a0cded2487a": {
    execute: input => {
      console.log("Received input:");
      console.log(input);
      return { name: input.name + 1 };
    }
  },
  "444e1e5a-d06f-448b-b01d-990db2f6b1c4": {
    execute: input => {
      console.log("Received input:");
      console.log(input);
      return { name: input.name + 1 };
    }
  },
  "2ad0bf75-2ae2-4815-b618-74eddaae6d33": {
    execute: input => {
      console.log("Received input:");
      console.log(input);
      return { name: input.name + 1 };
    }
  }
};

const __subscribers__ = {
  "87f61a95-6fcc-4571-97f5-e2a3e49dad73": [],
  "f978c61b-f295-49d8-840f-bb0e1d0743e8": [
    // "f978c61b-f295-49d8-840f-bb0e1d0743e8", // Recursion.
    "a765bfe3-1dc0-43b6-bb4c-8a0cded2487a",
    "444e1e5a-d06f-448b-b01d-990db2f6b1c4"
  ],
  "a765bfe3-1dc0-43b6-bb4c-8a0cded2487a": [],
  "444e1e5a-d06f-448b-b01d-990db2f6b1c4": [
    "87f61a95-6fcc-4571-97f5-e2a3e49dad73",
    "f978c61b-f295-49d8-840f-bb0e1d0743e8" // Circuit.
  ],
  "2ad0bf75-2ae2-4815-b618-74eddaae6d33": [
    "444e1e5a-d06f-448b-b01d-990db2f6b1c4"
  ]
};

const __queue__ = {};

const __cache__ = {};

const a = input => {
  return input;
};

// Receive and execute.
const receiveAndExecute = async () => {
  for (const fid of Object.keys(__functions__)) {
    /*
    // start the worker pool
    await startPool();
    */
    nrp.on(`${fid}`, async message => {
      const fn = __functions__[fid];
      const output = fn.execute(message.message);
      /*
      const res = await job(
        data => {
          console.log("Received message from " + data.message.source + ":");
          var execute = new Function('return ' + data.fn.toString())()
          // const f = a(data.message)
          // console.log(`o: ${fn}`)
          // console.log("data:");
          // console.log(data);
          // console.log(data.message.message.name);
          // let i = 0
          // for (i = 0; i < 1000000; i++) {
          //   // heavy CPU load ...
          // }
          // >>>>
          // TODO: require module! (or add to host thread)
          console.log(execute.toString())
          const output = execute(data.message.message);
          console.log("output: " + JSON.stringify(output))
          // <<<<
          // console.log(`1: ${output}`);
          // data.message.message.name = data.message.message.name + 1
          // const output = data.message.message

          // <MOCK_FUNCTION>
          // data.message = execute(data.message.message);
          // data.message.message.name = data.message.message.name  + 1
          // <MOCK_FUNCTION>

          return output;
        },
        // j(execute.execute),
        { data: { fn: fn.execute.toString(), message } }
      );
      const output = res;
      console.log(`2:`);
      console.log(output);
      */

      // Enqueue output
      for (const sid of __subscribers__[fid]) {
        console.log(`output to ${sid}`);
        console.log(output);
        __queue__[sid].push(output);
      }
    });

    /*
  // TODO: Put into `gesso` function to enable async?
  // Do something after subscribe finishes
  nrp.on('mydata:sync', function(myData) {
    console.log(myData);
  }, function() {
    nrp.emit('mydata:requestsync'); // request a sync of the data after the handler is registered, so there are no race conditions
  });
  */
  }
};
receiveAndExecute();

// nrp.emit("say hello", { name: "Louis" }) // Outputs 'Hello Louis'

// You can use patterns to capture all messages of a certain type
// The matched channel is given as a second parameter to the callback
// nrp.on("city:*", (data, channel) => {
//   console.log(data.city + " is great")
// })

// nrp.emit("city:hello", { city: "Paris" }) // Outputs 'Paris is great'
// nrp.emit("city:yeah", { city: "San Francisco" })

const dispatch = (fid, message) => {
  // console.log(`dispatch from ${fid}`);
  // console.log(message);
  for (const sid of __subscribers__[fid]) {
    // console.log(`dispatch to ${sid}`);
    nrp.emit(sid, {
      source: fid,
      message
    });
  }
};

setTimeout(() => {
  console.log("Seeding messages");
  for (const fn of Object.keys(__functions__)) {
    // for (const subscriber of __subscribers__[fn]) {
    if (!__queue__[fn]) {
      __queue__[fn] = [];
    }
    __queue__[fn].push({
      name: 0
    });
    // dispatch(fn, subscriber, {
    //   name: "Louis"
    // });
    // }
  }
}, 800);

const gesso = id => {
  return {
    now: input => {
      const fn = __functions__[id];
      return async () => {
        return dispatch(boundSourceFunctionId, id, input);
      };
      return "one off computation";
    },
    next: async () => {
      // Async so can block execution of continuation instance until return? Or load up queue? Hm.
      return "continuation";
    }
  };
};
const $ = gesso;

gesso("uuid").now({ foo: "some output" });
$("uuid").now({ foo: "some output" });

// var unsubscribe = nrp.on('say hello', function(data){
//   // Never called
// });

// unsubscribe([Callback]);

// // Safely (connections will be closed properly once all commands are sent)
// nrp.quit()

// // Dangerously (connections will be immediately terminated)
// nrp.end()

// ----------------------------------------------------------------------------
//
// Execution strategy 1.
//
// ----------------------------------------------------------------------------

const start = async queues => {
  // TODO: Replace with on("gesso:input:*") handler to make more async/distributable.
  // console.log("queues");
  // console.log(queues);
  return new Promise((resolve, reject) => {
    try {
      for (const fid of Object.keys(__functions__)) {
        // const fn = __functions__[fid];
        if (queues[fid] && queues[fid].length > 0) {
          // console.log(queues[fid]);
          const input = queues[fid].shift();

          // console.log(`fid: ${fid}`);
          // console.log(`sid: ${sid}`)
          // console.log(`input:`);
          // console.log(input);

          // <THREAD_POOL>
          // const output = fn.execute(input);
          dispatch(fid, input);
          // </THREAD_POOL>

          // for (const sid of __subscribers__[fid]) {
          //   console.log(`next ${sid}`);
          //   queues[sid].push(output);
          // }
          // console.log("done");
        }
      }
      return resolve();
    } catch (err) {
      return err;
    }
  }).then(() => {
    setTimeout(() => {
      start(queues);
    });
  });
};

// (async () => {
//   await start(__queue__);
// })();

// ----------------------------------------------------------------------------
//
// Execution strategy 2.
//
// ----------------------------------------------------------------------------

const enqueue = (fid, message) => {
  nrp.emit(`gesso:fn:${fid}`, message);
};

const initialize = () => {
  for (const fid of Object.keys(__functions__)) {
    nrp.on(`gesso:fn:${fid}`, input => {
      // dispatch(fid, input);

      const fn = __functions__[fid];
      const output = fn.execute(input);

      // Queue output for subscriber consumption.
      for (const sid of __subscribers__[fid]) {
        enqueue(sid, output);
      }
    });
  }
};

initialize();
setTimeout(() => {
  for (const fid of Object.keys(__functions__)) {
    // Wait until message confirmation then return for async calls.
    enqueue(fid, __queue__[fid]);
  }
}, 1000);
