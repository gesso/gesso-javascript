const NRP = require("node-redis-pubsub");
const { job, start: startPool, stop } = require("microjob");

const config = {
  port: 6379, // Port of your remote Redis server
  host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
  // auth: 'password'                  , // Password
  scope: "gesso" // Use a scope to prevent two NRPs from sharing messages
};

const nrp = new NRP(config); // This is the NRP client

const __functions__ = {
  // "87f61a956fcc457197f5e2a3e49dad73": new RandomWordFunction.Function(),
  // f978c61bf29549d8840fbb0e1d0743e8: {
  //   execute: async input => {
  //     console.log("Received input:");
  //     console.log(input);
  //     return { name: input.name + 1 };
  //   }
  // },
  // a765bfe31dc043b6bb4c8a0cded2487a: {
  //   execute: async input => {
  //     console.log("Received input:");
  //     console.log(input);
  //     return { name: input.name + 1 };
  //   }
  // },
  // "444e1e5ad06f448bb01d990db2f6b1c4": {
  //   execute: async input => {
  //     console.log("Received input:");
  //     console.log(input);
  //     return { name: input.name + 1 };
  //   }
  // },
  // "2ad0bf752ae24815b61874eddaae6d33": {
  //   execute: async input => {
  //     console.log("Received input:");
  //     console.log(input);
  //     return { name: input.name + 1 };
  //   }
  // }
};

const initializeFunctions = () => {
  const fnames = ["random-number", "random-word"];
  for (const fname of fnames) {
    const functionModule = require(`./functions/${fname}`);
    const manifest = functionModule.manifest;
    __functions__[manifest.id] = new functionModule.Function();
  }
};
initializeFunctions();

const __subscribers__ = {
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
  __subscribers__[fid] = [];
}
for (const fid of Object.keys(__functions__)) {
  __subscribers__[fid] = Object.keys(__functions__);
}

const __queue__ = {};

const __cache__ = {};

const dispatch = async (fid, input) => {
  for (const sid of __subscribers__[fid]) {
    nrp.emit(`gesso:fn:${sid}`, {
      source: fid,
      input
    });
  }
};

const seed = () => {
  setTimeout(() => {
    console.log("Seeding messages");
    for (const fn of Object.keys(__functions__)) {
      if (!__queue__[fn]) {
        __queue__[fn] = [];
      }
      __queue__[fn].push({
        name: 0
      });
    }
    // __queue__["87f61a956fcc457197f5e2a3e49dad73"] = []
    // __queue__["87f61a956fcc457197f5e2a3e49dad73"].push({
    //   sentence: "Michael is the best in the west."
    // })
  }, 800);
};

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

// TODO: Put behind HTTP request: DELETE /functions/{fid}/subscribers/{sid}
// unsubscribe([Callback]);

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
    nrp.on(`gesso:fn:${fid}`, async message => {
      // dispatch(fid, input);

      const fn = __functions__[fid];
      const output = await fn.execute(message.input);
      console.log(`output: ${output}`);

      // Queue output for subscriber consumption.
      // for (const sid of __subscribers__[fid]) {
      //   enqueue(sid, output);
      // }
      await dispatch(fid, output);
    });
  }
};

seed();
initialize();
setTimeout(() => {
  for (const fid of Object.keys(__functions__)) {
    // Wait until message confirmation then return for async calls.
    for (const input of __queue__[fid]) {
      enqueue(fid, {
        input
      });
    }
  }
}, 1000);

process.on("SIGINT", function() {
  console.log("Got SIGINT.  Going to exit.");
  // Safely (connections will be closed properly once all commands are sent)
  nrp.quit();
  // Dangerously (connections will be immediately terminated)
  // nrp.end();
  // Your code to execute before process kill.
  process.kill(process.pid);
});
