const NRP = require("node-redis-pubsub"); // TODO: Replace with UDP (client and server in one (loopback)); test pubsub with file descriptors (remove all dependencies and use node-redis-pubsub as an plugin/extension)
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

// function ensureExists(path, mask, callback) {
//   const fs = require("fs");
//   if (typeof mask == "function") {
//     // allow the `mask` parameter to be optional
//     callback = mask;
//     mask = 0777;
//   }
//   fs.mkdir(path, mask, (err) => {
//     if (err) {
//       if (err.code == "EEXIST") {
//         // ignore the error if the folder already exists
//         console.log("folder exists")
//         callback(null);
//       } else {
//         // something else went wrong
//         console.log("something went wrong")
//         callback(err)
//       }
//     } else {
//       console.log("created folder")
//       callback(null); // successfully created folder
//     }
//   });
// }

// command: "gesso new"
// description: create new gesso workspace
const gessoNew = () => {
  const fs = require("fs");
  const { uniqueNamesGenerator } = require("unique-names-generator");
  // Check if `./gesso.json` exists, else use `~/.gesso.json`, else TEMPORARY_DIR/.gesso.json (ephemeral).

  // const gessoFunction = `${os.homedir()}/.gesso-redux`;
  const functionName = uniqueNamesGenerator({ separator: "-", length: 3 });
  const functionId = uuid.v4();
  // ensureExists(`./functions/${functionId}`, 0744, (err) => {
  //   if (err) {
  //     return; // handle folder creation error
  //   } else {
  //     // we're all good
  //     print.info(`created function ${gessoFunction}`);
  //   }
  // });
  fs.mkdirSync(`./functions/${functionName}`, { recursive: true });

  let manifest = {
    id: functionId,
    version: "0.0.0",
    name: functionName
  };
  let formatted = JSON.stringify(manifest, null, 2);

  // Check if file exists.
  const gessoFile = `./functions/${functionName}/manifest.json`;
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
  const functionFile = `./functions/${functionName}/index.js`;
  const functionCode =
    'class Function {\r\n  constructor() {}\r\n\r\n  execute(input) {\r\n    const filePath = input.filePath;\r\n    console.log(`writing gessofile`)\r\n    // no return\r\n  }\r\n}\r\n\r\nif (require.main === module) {\r\n  if (process.argv) {\r\n    const fn = new Function();\r\n    const output = fn.execute();\r\n    console.info(output);\r\n    // TODO: Write to pipe output.\r\n  }\r\n}\r\n\r\nmodule.exports.Function = Function;\r\n\r\nmodule.exports.manifest = require("./manifest.json")';
  fs.writeFileSync(functionFile, functionCode);

  // create in home

  // create ephemeral
};

// TODO: Define configuration execution profiles (default is greedy, so emits to all listeners, not just one with Promise.race or workers, for example). Profile wasted computation to optimize (i.e., redundant computation that's not used due to lost race) ; test with current implementation using "unsubscribe" to block context resolution

// TODO: Create default configuration generator that uses default credentials/configs to try
const nrp = new NRP({
  port: 6379, // Port of your remote Redis server
  host: "127.0.0.1", // Redis server host, defaults to 127.0.0.1
  // auth: 'password'                  , // Password
  scope: "gesso" // Use a scope to prevent two NRPs from sharing messages
}); // This is the NRP client

const __status__ = {
  id: undefined
};

const __peers__ = {};

const __functions__ = {};

const __observers__ = {};

const __queue__ = {};

const __context__ = {};

// <MOVE_INTO_IMPORTABLE_LIBRARIES_FOR_FUNCTION>
const __cache__ = {};
const __database__ = {};
// </MOVE_INTO_IMPORTABLE_LIBRARIES_FOR_FUNCTION>

const identify = () => {
  // TODO: Read from `./gesso` or `~/.gesso` if available.
  print.info(`mode: ephemeral`);
  __status__.id = uuid.v4();
};
identify();

// TODO: Test without .gessoginroe
// TODO: Test with empty function path
// TODO: Test with malformed manifest.json
// TODO: Test with version mismatch (i.e., don't exclude version)
// TODO: Test with version match (i.e., exclude version)

// TODO: Create minimal cross-platform interactive UI framework to get input, print message, show image, wait to submit drawing, ... ; demo: implement chat / announcement / sound synchronize using feedback and genetic algorithms to optimize / voice input -> voice output

// TODO: Extend to include discover/profile inputs from network, etc.
// TODO: Extend "index"/"prepare"/"discover"/"profile" to gather system info (info from: https://nodejs.org/api/os.html), OS, CPUs/threads, language interpreters, whether Docker is installed, etc.
// TODO:     <protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>] ; https://docs.npmjs.com/cli/install ; https://stackoverflow.com/questions/20686244/install-programmatically-a-npm-package-providing-its-version
const prepare = () => {
  const fs = require("fs");
  // TODO: const furis = []; // TODO: URIs from manifests, app manifest, user input, gesso message from another host to replicate availability, etc. (fs is just one possibility, might be git (lazy load module) for example)
  // TODO: include ~/.gesso and $PWD/.gesso functions as well (path in .gesso).

  const fdirs = fs
    .readdirSync("./functions", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  print.debug("fdirs:");
  print.debug(fdirs);

  // Get function names (ignore in .gessoignore) as `fnames`.
  const fignore = (() => {
    try {
      // Check for local `.gesso` AND `.gessoignore`, else use `~/.gessoignore`
      return require(`./.gessoignore.json`);
    } catch (err) {
      print.debug(".gessoignore.json not found");
      return;
    }
  })();

  // exclude functions in `./.gessoignore` if `.gesso` is present, else
  // `~/.gessoignore` if present
  const fnames = [];
  for (const fdir of fdirs) {
    // const fname = fdir;
    try {
      const fmodule = require(`./functions/${fdir}`);
      const fmanifest = fmodule.manifest;
      // const fname = fmanifest.name; // TODO: Change to UUID or userpath (e.g., something like in npm modules... @mgub/gesso-app)
      print.debug(`checking "${fmanifest.name}" ${fmanifest.version}`);
      if (fignore && fignore[fmanifest.name]) {
        print.debug("checking .gessoignore");
        print.debug(fmanifest);
        // check version
        if (fignore[fmanifest.name] === fmanifest.version) {
          print.debug(`${fmanifest.name} version mismatch: ignoring`);
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
      print.error(`"${fdir}" failure`);
      // print.error(`"${fdir}" not found`);
    }
  }

  // TODO: Programatically import NPM modules for fname functions.

  return {
    fnames,
    hpeers: [] // host peers, discovered on network on "gesso:announce:*" (and after handshake, any auth configured (JWT))
  };
};

// Register functions (if there's a .gesso file else ~/.gesso). (v2.0.0)
const register = () => {
  const { fnames, fhosts } = prepare();
  print.info("fnames:");
  print.info(fnames);
  print.info("fhosts:");
  print.info(fhosts); // print their fnames as well

  // Import and register functions.
  // const fnames = ["random-number", "random-word", "echo"];
  for (const fname of fnames) {
    // try {
    const fmodule = require(`./functions/${fname}`);
    const fmanifest = fmodule.manifest;
    __functions__[fmanifest.id] = fmodule;
    // __functions__[manifest.id] = new functionModule.Function(); // Singleton/server/daemon (option on import) ; if a server is required and no other machines are available for additional requirements, throw error
    // } catch (err) {
    //   continue;
    // }
  }

  // Store references to function observers.
  for (const fid of Object.keys(__functions__)) {
    __observers__[fid] = [];
  }

  // TODO: Read from manifest and watch for changes or lazy load as needed (option). Version each function automatically as a Git repo (in manifest, store version => commit map)
  // Register observers.
  for (const fname of fnames) {
    const fmodule = require(`./functions/${fname}`);
    const fmanifest = fmodule.manifest;
    if (fmanifest["observers"]) {
      __observers__[fmanifest.id] = Object.keys(fmanifest.observers);
      // __functions__[manifest.id] = new functionModule.Function(); // Singleton/server/daemon (option on import)
    }
  }
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
  nrp.on(`gesso:function:${fid}`, consume(fid));
};

// "announce" message (put in async loop)
nrp.emit(`gesso:ping:${__status__.id}`, __status__);

// TODO: Accept commands with cron job schedule (the host will then request execution of the job at the scheduled time... maybe with lookahead to plan based on prior execution metrics so 1+ hosts can be available)

// <PEER_DISCOVERY>
// TODO: Move into prepare()

nrp.on(`gesso:ping:*`, async gesso => {
  print.debug(`ping: ${gesso.id}`);
  // emit back (to boostrap mutual peer discovery) and enable host for use, share functions, etc. (test with multiple directories with a `./gesso` file)
  // generate ephemeral session host if there's no `./.gesso.json` or `~/.gesso.json` with "id" property (use same init function but with ephemeral `id` passed as parameter)
  const pong = {
    id: __status__.id
    // session: "session-id" // uuid per invocatino of `gesso`
  };
  nrp.emit(`gesso:pong:${gesso.id}`, pong);
});

nrp.on(`gesso:pong:${__status__.id}`, async status => {
  print.debug(`pong: ${status.id}`);
  // register `message.source` as a peer (this is the request back from "ping" announcement)
  __peers__[status.id] = status;
});

nrp.on(`gesso:disconnect:*`, async status => {
  print.debug(`disconnect: ${status.id}`);
  // register `message.source` as a peer (this is the request back from "ping" announcement)
  delete __peers__[status.id];
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
    const channel = `gesso:function:${message.source}:${message.contextId}`;
    nrp.emit(channel, {
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
  print.debug("dispatch");
  // TODO: "deep" option to await observer output with Promise.all.
  for (const oid of __observers__[fid]) {
    enqueue(oid, input);
  }
};

// TODO: option to await respones from subscribers as well (deep call, tree call); return when there are no more subscribers (don't allow circular?)
// TODO: correlation id => promise to await via pubsub
const enqueue = async (fid, input) => {
  print.debug("enqueue");

  const contextId = uuid.v4();

  const context = {
    startTime: Date.now()
  };

  // TODO: Promise.race to share Redis.
  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __context__[contextId] = context;

  // Send input and await function output.
  const channel = `gesso:function:${fid}:${contextId}`;
  const unsubscribe = nrp.on(channel, output => {
    const duration = Date.now() - context.startTime;
    print.debug(`duration: ${duration}`);
    const hasResponse = unsubscribe(() => {
      print.debug(`Unsubscribe ${channel}`);
    });
    print.debug(`hasResponse: ${hasResponse}`);
    delete __context__[contextId];
    context.resolve(output);
  });

  // Emit function invocation.
  const message = {
    contextId: contextId,
    source: fid,
    input
  };
  nrp.emit(`gesso:function:${fid}`, message);

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
  if (input && input.length > 0 && input === "@@") {
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
      const context = await enqueue(fid, input);
      const output = context.output;
      print.debug(`context:`);
      print.debug(context);
      print.debug(`output:`);
      print.info(output);
      // }
    }
  } else {
    // TODO: Add default handler
  }
};

// TODO: class REPL
const startREPL = process => {
  const { argv } = process;

  initialize();

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
    process.stdout.write("$ ");
  });

  process.on("SIGINT", () => {
    print.info("Got SIGINT.  Going to exit.");
    // Emit disconnection event to peers.
    nrp.emit(`gesso:disconnect:${__status__.id}`, {
      id: __status__.id
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
  print.debug(process.stdin);

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
      await initialize();
      // Option 2: Command line input.
      // TODO: const output = execute(process.argv)
      const input = parseInput(process.argv.slice(2)[0]);
      console.log("Flah");
      console.log(JSON.stringify(input));
      const output = await evaluateInput(input);
      console.log("OUTPUT:");
      console.log(output);
      process.exit(0);
    })();
  }

  if (!hasPipeInput && !hasArguments) {
    // Option 3: REPL. Received no input and no piped data.
    if (!process.argv[2]) {
      startREPL(process);
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
