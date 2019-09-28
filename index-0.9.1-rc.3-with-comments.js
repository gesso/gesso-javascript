const uuid = require("uuid");

// TODO: Move to ./gesso or ~/.gesso as optional setting
const DISABLE_LOGGING = false;

const print = (levels => {
  return ["info", "debug", "warn", "log", "error"].reduce((printer, level) => {
    printer[level] = message =>
      DISABLE_LOGGING || (levels && !levels.includes(level))
        ? {}
        : console[level](message);
    return printer;
  }, {});
})(["info", "debug"]);

// ----------------------------------------------------------------------------
//
//  Default functions.
//
// ----------------------------------------------------------------------------

// command: "gesso install"
// description: create ~/.gesso.json
const gessoInit = () => {
  const fs = require("fs");
  const os = require("os");
  let config = {
    id: uuid.v4() // "get-from-system-info"
  };
  let formatted = JSON.stringify(config, null, 2);

  // create in pwd
  const gessoFile = `${os.homedir()}/.gesso.json`;
  fs.writeFileSync(gessoFile, formatted);
  print.info(`Wrote "~/.gesso.json" file.`);
};

// command: "gesso install"
// description: install a function
const gessoInstall = () => {
  // TODO:
};

// command: "gesso edit"
// description: edit a project
const gessoEdit = () => {
  // TODO: Install if it doesn't exist.
  // TODO: Start server.
};

// command: "gesso new"
// description: create new gesso workspace
const gessoNew = () => {
  const fs = require("fs");
  const {
    uniqueNamesGenerator: generateUniqueName
  } = require("unique-names-generator");
  // Check if `./gesso.json` exists, else use `~/.gesso.json`, else TEMPORARY_DIR/.gesso.json (ephemeral).

  // const gessoFunction = `${os.homedir()}/.gesso-redux`;
  const functionName = generateUniqueName({ separator: "-", length: 3 });
  const functionId = uuid.v4();
  // ensureExists(`./functions/${functionId}`, 0744, (err) => {
  //   if (err) {
  //     return; // handle folder creation error
  //   } else {
  //     // we're all good
  //     print.info(`created function ${gessoFunction}`);
  //   }
  // });
  fs.mkdirSync(`${__host__.dir}/functions/${functionName}`, { recursive: true });

  let manifest = {
    id: functionId,
    version: "0.0.0",
    name: functionName
  };
  let formatted = JSON.stringify(manifest, null, 2);

  // Check if file exists.
  const gessoFile = `${__host__.dir}/functions/${functionName}/manifest.json`;
  try {
    if (fs.existsSync(gessoFile)) {
      print.info(`local .gesso.json already exists`);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  // write `./functions/{functionId}/manifest.json`
  fs.writeFileSync(gessoFile, formatted);

  // write `./functions/{functionId}/index.js`
  const functionFile = `${__host__.dir}/functions/${functionName}/index.js`;
  const functionCode =
    'class Function {\r\n  constructor() {}\r\n\r\n  execute(input) {\r\n    const filePath = input.filePath;\r\n    console.log(`writing gessofile`)\r\n    // no return\r\n  }\r\n}\r\n\r\nif (require.main === module) {\r\n  if (process.argv) {\r\n    const fn = new Function();\r\n    const output = fn.execute();\r\n    console.info(output);\r\n    // TODO: Write to pipe output.\r\n  }\r\n}\r\n\r\nmodule.exports.Function = Function;\r\n\r\nmodule.exports.manifest = require("./manifest.json")';
  fs.writeFileSync(functionFile, functionCode);

  // create in home

  // create ephemeral
};

// ----------------------------------------------------------------------------
//
//  Library functions.
//
// ----------------------------------------------------------------------------

const __cache__ = {};

const __database__ = {};

// ----------------------------------------------------------------------------
//
//  Interpreter and runtime functions.
//
// ----------------------------------------------------------------------------

// TODO: Define configuration execution profiles (default is greedy, so emits to all listeners, not just one with Promise.race or workers, for example). Profile wasted computation to optimize (i.e., redundant computation that's not used due to lost race) ; test with current implementation using "unsubscribe" to block context resolution
// TODO: Create default configuration generator that uses default credentials/configs to try

const __default__ = {
  dispatcher: {
    io: {
      // Replace with UDP, file descriptors, etc. or some other native solution
      // to remove dependencies.
      redis: {
        port: 6379, // Port of your remote Redis server
        host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
        // auth: 'password'                  , // Password
        scope: "gesso" // Use a scope to prevent two NRPs from sharing messages
      }
    }
  }
};

const __config__ = __default__;

const __host__ = {
  id: undefined
};

const __hosts__ = {};

const __functions__ = {};

const __observers__ = {};

const __inputs__ = {};

const __context__ = {};

const queue = (() => {
  // TODO: Replace with UDP (client and server in one (loopback)); test pubsub with file descriptors (remove all dependencies and use node-redis-pubsub as an plugin/extension)
  const NRP = require("node-redis-pubsub");
  // node-redis-pubsub client
  const nrp = new NRP(__config__.dispatcher.io.redis);
  return {
    on: (...args) => nrp.on(...args),
    emit: (...args) => nrp.emit(...args)
  };
})();

const authenticate = () => {
  print.debug("Authenticating");
  // TODO: Read from `./gesso` or `~/.gesso` if available.
  print.info(`mode: ephemeral`);
  __host__.id = uuid.v4();
  __host__.dir = process.cwd()

  __hosts__[__host__.id] = __host__;
};

// TODO: Test without .gessoginroe
// TODO: Test with empty function path
// TODO: Test with malformed manifest.json
// TODO: Test with version mismatch (i.e., don't exclude version)
// TODO: Test with version match (i.e., exclude version)

// TODO: Create minimal cross-platform interactive UI framework to get input, print message, show image, wait to submit drawing, ... ; demo: implement chat / announcement / sound synchronize using feedback and genetic algorithms to optimize / voice input -> voice output

// TODO: Extend to include discover/profile inputs from network, etc.
// TODO: Extend "index"/"prepare"/"discover"/"profile" to gather system info (info from: https://nodejs.org/api/os.html), OS, CPUs/threads, language interpreters, whether Docker is installed, etc.
// TODO:     <protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>] ; https://docs.npmjs.com/cli/install ; https://stackoverflow.com/questions/20686244/install-programmatically-a-npm-package-providing-its-version
// Index functions.
const index = () => {
  const fs = require("fs");
  // TODO: const furis = []; // TODO: URIs from manifests, app manifest, user input, gesso message from another host to replicate availability, etc. (fs is just one possibility, might be git (lazy load module) for example)
  // TODO: include ~/.gesso and $PWD/.gesso functions as well (path in .gesso).


  const fdirs = fs
    .readdirSync(`${__host__.dir}/functions`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  print.debug("fdirs:");
  print.debug(fdirs);

  // Get function names (ignore in .gessoignore) as `fnames`.
  const fignore = (() => {
    try {
      // Check for local `.gesso` AND `.gessoignore`, else use `~/.gessoignore`
      return require(`${__host__.dir}/.gessoignore.json`);
    } catch (err) {
      print.debug(".gessoignore.json not found");
      return;
    }
  })();
  print.debug(".gessoignore.json");
  print.debug(fignore);

  // exclude functions in `./.gessoignore` if `.gesso` is present, else
  // `~/.gessoignore` if present
  const fnames = [];
  for (const fdir of fdirs) {
    // const fname = fdir;
    try {
      const fmodule = require(`${__host__.dir}/functions/${fdir}`);
      const fmanifest = fmodule.manifest;
      // const fname = fmanifest.name; // TODO: Change to UUID or userpath (e.g., something like in npm modules... @mgub/gesso-app)
      print.debug(`checking "${fmanifest.name}" ${fmanifest.version}`);
      if (fignore && fignore[fmanifest.name]) {
        // print.debug("checking .gessoignore");
        // print.debug(fignore);
        // check version
        if (fignore[fmanifest.name] === fmanifest.version) {
          print.debug(`ignoring ${fmanifest.name} version mismatch`);
          continue;
        } else {
          print.debug(`${fmanifest.name} version match: ok`);
        }
      }

      // TODO: Install function version if unavailable (on local and/or network).
      // if (fignore[fname] === fmmanifest.version) {
      //   log(
      //     `.gessoignore ${fname} version mismatch: installing version ${fmanifest.version}...`
      //   );
      // }

      print.info(`importing "${fmanifest.name}"`);
      fnames.push(fmanifest.name);
    } catch (err) {
      print.error(`$corrupt function "{fdir}"`);
      // print.error(`"${fdir}" not found`);
    }
  }

  // TODO: Programatically import NPM modules for fname functions.

  return {
    fnames
    // hpeers: [] // host peers, discovered on network on "gesso:announce:*" (and after handshake, any auth configured (JWT))
  };
};

// Register functions (if there's a .gesso file else ~/.gesso). (v2.0.0)
const initialize = () => {
  const { fnames, fhosts } = index();
  print.info("fnames:");
  print.info(fnames);
  // print.info("fhosts:");
  // print.info(fhosts); // print their fnames as well

  // Import and register functions.
  // const fnames = ["random-number", "random-word", "echo"];
  for (const fname of fnames) {
    const fmodule = require(`${__host__.dir}/functions/${fname}`);
    const fmanifest = fmodule.manifest;
    __functions__[fmanifest.id] = fmodule;
  }

  // Store references to function observers.
  for (const fid of Object.keys(__functions__)) {
    __observers__[fid] = [];
  }

  // Initialize input queues.
  for (const fid of Object.keys(__functions__)) {
    if (!__inputs__[fid]) {
      __inputs__[fid] = [];
    }
  }

  // TODO: Read from manifest and watch for changes or lazy load as needed (option). Version each function automatically as a Git repo (in manifest, store version => commit map)
  // Register observers.
  for (const fname of fnames) {
    const fmodule = require(`${__host__.dir}/functions/${fname}`);
    const fmanifest = fmodule.manifest;
    if (fmanifest["observers"]) {
      __observers__[fmanifest.id] = Object.keys(fmanifest.observers);
      // __functions__[manifest.id] = new functionModule.Function(); // Option: Singleton/server/daemon (option on import)
    }
  }
};

// ----------------------------------------------------------------------------
//
// Runtime.
//
// ----------------------------------------------------------------------------

// const connectQueues = () => {
//   // Connect to queues.
//   for (const fn of Object.keys(__functions__)) {
//     if (!__inputs__[fn]) {
//       __inputs__[fn] = [];
//     }
//     // __queue__[fn].push({
//     //   name: 0
//     // });
//   }
// };

// Expose functions for use in distirbuted execution.
const connect = () => {
  for (const fid of Object.keys(__functions__)) {
    expose(fid);
  }
};

const start = () => {
  authenticate(); // initialize?
  initialize();
  connect();
};

// Activate function so it's available and can receive input.
// TODO: Add fifo option (block and await confirmation of context resolution)
const expose = fid => {
  // TODO: FIFO queue or immediate. If blocking on FOFO, network to spawn new immediate or another queue (ephemeral)
  queue.on(`gesso:function:${fid}`, consume(fid));
};

// "announce" message (put in async loop)
queue.emit(`gesso:host:${__host__.id}`, __host__);

// TODO: Accept commands with cron job schedule (the host will then request execution of the job at the scheduled time... maybe with lookahead to plan based on prior execution metrics so 1+ hosts can be available)

// <PEER_DISCOVERY>
// TODO: Move into prepare()

queue.on(`gesso:host:*`, async host => {
  print.debug(`host: ${host.id}`);
  // emit back (to boostrap mutual peer discovery) and enable host for use, share functions, etc. (test with multiple directories with a `./gesso` file)
  // generate ephemeral host if there's no `./.gesso.json` or `~/.gesso.json` with "id" property (use same init function but with ephemeral `id` passed as parameter)
  const ok = {
    id: __host__.id
    // host: "host-id" // uuid per invocatino of `gesso`
  };
  queue.emit(`gesso:ok:${host.id}`, ok);
});

queue.on(`gesso:ok:${__host__.id}`, async host => {
  print.debug(`ok: ${host.id}`);
  // register `message.source` as a peer (this is the request back from "ping" announcement)
  __hosts__[host.id] = host;
});

queue.on(`gesso:exit:*`, async host => {
  print.debug(`host ${host.id} left`);
  // register `message.source` as a peer (this is the request back from "ping" announcement)
  delete __hosts__[host.id];
});
// </PEER_DISCOVERY>

// dequeue and consume from the function's input queue
const consume = fid => {
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
    const channel = `gesso:context:${message.contextId}`;
    queue.emit(channel, {
      contextId: null,
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
  print.debug(`dispatch ${fid}`);
  // TODO: "deep" option to await observer output with Promise.all.
  for (const oid of __observers__[fid]) {
    emit(oid, input);
  }
};

// TODO: option to await respones from subscribers as well (deep call, tree call); return when there are no more subscribers (don't allow circular?)
// TODO: correlation id => promise to await via pubsub
const emit = async (fid, input) => {
  print.debug(`emit ${fid}`);

  const contextId = uuid.v4();
  const context = {
    startTime: Date.now()
  };
  print.debug(`context: ${contextId}`);
  print.debug(context);

  // TODO: Promise.race to share Redis.
  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __context__[contextId] = context;

  // Send input and await function output.
  const channel = `gesso:context:${contextId}`;
  print.debug(`subscribe ${channel}`);
  const unsubscribe = queue.on(channel, output => {
    // const duration = Date.now() - context.startTime;
    // print.debug(`duration: ${duration}`);
    const hasResponse = unsubscribe(() => {
      print.debug(`unsubscribe ${channel}`);
    });
    print.debug(`has response: ${hasResponse}`);
    delete __context__[contextId];
    context.resolve(output);
  });

  // Emit function invocation.
  const message = {
    contextId: contextId,
    source: fid,
    input
  };
  queue.emit(`gesso:function:${fid}`, message);

  return promise;
};

// ----------------------------------------------------------------------------
//
//  Interpreter.
//
// ----------------------------------------------------------------------------

// TODO: Execute command (regardless of input mode).

// ----------------------------------------------------------------------------
//
//  REPL.
//
// ----------------------------------------------------------------------------

// "gesso install"
// "gesso new"
// "gesso [...args]"
// "gesso edit // open web-app editor in distributed UI framework (deployable to browser as well)
const parseInput = input => {
  // Remove newlines.
  return input.toString().trim();
};

const evaluateInput = async input => {
  if (!input || input.length <= 0) {
    print.debug(`no input`);
    return;
  }
  print.debug(`input: ${input}`);

  // command functions
  if (input === "install") {
    return gessoInstall();
  }
  if (input === "init") {
    return gessoInit();
  }
  if (input === "new") {
    return gessoNew();
  }
  if (input === "edit") {
    return gessoEdit();
  }

  // custom function
  if (input && input.length > 0 && input === "!") {
    console.log(input);
    for await (const fid of Object.keys(__functions__)) {
      console.log(fid);
      // TODO: load functions that should not be available for distributed execution (only on-demand on the same host) from manifest.json
      if (fid === "444e1e5ad06f448bb01d990db2f6b1c4") {
        continue;
      }
      // Wait until message confirmation then return for async calls.
      // for await (const input of __queue__[fid]) {
      // const processedInput// TODO: Apply middleware.
      const context = await emit(fid, input);
      const output = context.output;
      print.debug(`context: ${context.id}`);
      print.debug(context);
      print.debug(`output ${fid}:`);
      print.info(output);
      // }
    }
  } else {
    // TODO: Add default handler
  }
};

// TODO: class REPL
const prompt = process => {
  const { argv } = process;

  start();

  const stdin = process.openStdin();
  process.stdout.write("$ ");

  // Minimal bootstrap (can include .gesso or manifest.json to set defaults to install and load (provision)):
  // TODO: "help" command
  // TODO: "new" command - new function

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
    const input = parseInput(data);
    const output = await evaluateInput(input);
    // TODO: Save output to variable, if specified
    print.info(output);
    process.stdout.write("$ ");
  });

  process.on("SIGINT", () => {
    print.info("Got SIGINT.  Going to exit.");
    // Emit disconnection event to peers.
    queue.emit(`gesso:disconnect:${__host__.id}`, {
      id: __host__.id
    });
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
  print.debug(`command line arguments: ${process.argv.length}`);
  print.debug("stdin:");
  // print.debug(process.stdin);

  const hasPipeInput = !process.stdin.isTTY;
  const hasArguments = process.argv && process.argv.length > 2;

  // Option 1: Piped input.
  if (hasPipeInput) {
    const stdin = process.stdin;
    let input = "";
    stdin.setEncoding("utf8");
    stdin.on("data", chunk => {
      input += chunk;
    });
    stdin.on("end", () => {
      // TODO: const output = execute(process.argv)
      print.debug("Hello " + input);
      // TODO: Seaprate print.debug stdout stream from piped output stream
      process.stdout.write(JSON.stringify(output + addend));
    });
    stdin.on("error", console.error);
  }

  if (hasArguments) {
    (async () => {
      await start();
      // Option 2: Command line input.
      // TODO: const output = execute(process.argv)
      const input = parseInput(process.argv.slice(2)[0]);
      const output = await evaluateInput(input);
      console.log(output);
      process.exit(0);
    })();
  }

  if (!hasPipeInput && !hasArguments) {
    // Option 3: REPL. Received no input and no piped data.
    if (!process.argv[2]) {
      prompt(process);
    }
  }
} else {
  console.log("Importing Gesso as a Node module.");
}

// TODO: share this across pubsub (replicate and sync objects (operational transforms?))

// ----------------------------------------------------------------------------
//
//  Node module.
//
// ----------------------------------------------------------------------------

// Allows importing as a module to invoke programmatically or extend Gesso (framework/SDK module).
// TODO: module.exports.Gesso = Gesso;
module.exports.start = start;

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
