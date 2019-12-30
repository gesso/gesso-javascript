const uuid = require("uuid");
// const console = require("./console");

// ----------------------------------------------------------------------------
//
//  Configuration.
//
// ----------------------------------------------------------------------------

const __default__ = {
  id: undefined,
  dispatcher: {
    io: {
      redis: {
        port: 6379,
        host: "127.0.0.1",
        scope: "gesso"
      }
    }
  }
};

const __config__ = __default__;

// ----------------------------------------------------------------------------
//
//  System.
//
// ----------------------------------------------------------------------------

const queue = require("./queue")(__config__);

// ----------------------------------------------------------------------------
//
//  Runtime.
//
// ----------------------------------------------------------------------------

const __host__ = {};

const __hosts__ = {};

const __functions__ = {};

const __observers__ = {};

const __inputs__ = {};

const __context__ = {};

const authenticate = () => {
  console.debug("Authenticating:");

  if (!__host__.id) {
    console.info(`mode: ephemeral`);
  }
  __host__.id = uuid.v4();
  __host__.dir = process.cwd();

  __hosts__[__host__.id] = __host__;
};

const index = () => {
  console.debug("Indexing:");

  const fs = require("fs");

  const fdirs = fs
    .readdirSync(`${__host__.dir}/functions`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  console.info("fdirs:");
  console.info(fdirs);

  const fignore = (() => {
    try {
      return require(`${__host__.dir}/.gessoignore.json`);
    } catch (err) {
      console.debug(".gessoignore.json not found");
      return;
    }
  })();

  // Apply `.gessoignore`.
  const fnames = [];
  for (const fdir of fdirs) {
    try {
      const fmodule = require(`${__host__.dir}/functions/${fdir}`);
      const fmanifest = fmodule.manifest;
      // check gesso function
      console.info(`checking "${fmanifest.name}" ${fmanifest.version}`);
      if (fignore && fignore[fmanifest.name]) {
        if (fignore[fmanifest.name] === fmanifest.version) {
          console.info(`ignoring ${fmanifest.name} ${fmanifest.version}`);
          continue;
        } else {
          console.info(`keeping ${fmanifest.name} ${fmanifest.version}`);
        }
        // else "installing ${fmanifest.name}"
      }
      // console.info(`importing "${fmanifest.name}" ${fmanifest.version}`);
      fnames.push(fmanifest.name);
    } catch (err) {
      console.error(`$corrupt function "{fdir}"`);
    }
  }

  // Initialize functions.
  for (const fname of fnames) {
    const fmodule = require(`${__host__.dir}/functions/${fname}`);
    const fmanifest = fmodule.manifest;
    __functions__[fmanifest.id] = fmodule;
  }

  // Initialize input queues.
  for (const fid of Object.keys(__functions__)) {
    if (!__inputs__[fid]) {
      __inputs__[fid] = [];
    }
  }

  // Initialize observers.
  for (const fid of Object.keys(__functions__)) {
    __observers__[fid] = [];
  }

  // Register observers.
  for (const fname of fnames) {
    const fmodule = require(`${__host__.dir}/functions/${fname}`);
    const fmanifest = fmodule.manifest;
    if (fmanifest["observers"]) {
      __observers__[fmanifest.id] = Object.keys(fmanifest.observers);
    }
  }

  return {
    fnames
  };
};

const register = fid => {
  if (fid) {
    if (__functions__[fid]) {
      queue.on(`gesso:function:${fid}`, consume(fid));
      // TODO: Test emitter and listener and return promsie.
    }
  } else {
    for (const fid of Object.keys(__functions__)) {
      register(fid);
    }
  }
};

//  Peer host messaging and discovery.
const network = () => {
  // Listen.
  queue.on(`gesso:host:*`, async host => {
    console.debug(`host: ${host.id}`);
    const ok = {
      id: __host__.id
    };
    queue.emit(`gesso:ok:${host.id}`, ok);
  });

  queue.on(`gesso:ok:${__host__.id}`, async host => {
    console.debug(`ok: ${host.id}`);

    __hosts__[host.id] = host;
  });

  queue.on(`gesso:exit:*`, async host => {
    console.debug(`host ${host.id} left`);
    delete __hosts__[host.id];
  });

  // Announce.
  queue.emit(`gesso:host:${__host__.id}`, __host__);
};

const initialize = () => {
  authenticate();
  const { fnames, fhosts } = index();
  register();
  network();
};

const consume = fid => {
  return async message => {
    // Execute function.
    const fmodule = __functions__[fid];
    const output = await new fmodule.Function().execute(message.input);

    // Respond over queue to resolve context.
    const channel = `gesso:context:${message.contextId}`;
    queue.emit(channel, {
      contextId: null,
      source: fid,
      output
    });

    // Dispatch output.
    await dispatch(fid, output);

    // Return.
    return output;
  };
};

const dispatch = async (fid, input) => {
  console.debug(`dispatch ${fid}`);
  for await (const oid of __observers__[fid]) {
    await emit(oid, input);
  }
};

const emit = async (fid, input) => {
  console.debug(`emit ${fid}`);

  const contextId = uuid.v4();
  const context = {
    startTime: Date.now()
  };
  console.debug(`context: ${contextId}`);
  console.debug(context);

  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __context__[contextId] = context;

  const channel = `gesso:context:${contextId}`;
  console.debug(`subscribe ${channel}`);
  const unsubscribe = queue.on(channel, output => {
    const hasResponse = unsubscribe(() => {
      console.debug(`unsubscribe ${channel}`);
    });
    console.debug(`has response: ${hasResponse}`);
    delete __context__[contextId];
    context.resolve(output);
  });

  const message = {
    contextId: contextId,
    source: fid,
    input
  };
  queue.emit(`gesso:function:${fid}`, message);

  return await promise;
};

// ----------------------------------------------------------------------------
//
//  Interpreter.
//
// ----------------------------------------------------------------------------

// Parse arguments and create input object.
const parse = require("./parser").parse;

const evaluate = async (fname, finput) => {
  // TODO: Validate function name.
  // Validate input for function.
  if (!finput || finput.length <= 0) {
    console.info(`no input`);
    return;
  }
  console.info(`input:`);
  console.info(finput);

  // Emit input to function.
  for await (const fid of Object.keys(__functions__)) {
    if (__functions__[fid].manifest.name === fname) {
      // TODO: If the function isn't yet connected, this will fail... handle that case.
      const context = await emit(fid, finput);
      return context.output;
    }
  }
};

const stop = () => {
  queue.emit(`gesso:exit:${__host__.id}`, {
    id: __host__.id
  });
  queue.quit();
};

// ----------------------------------------------------------------------------
//
//  Commands.
//
// ----------------------------------------------------------------------------

// TODO: install function from GH/NPM repo (where?)

// TODO: new function

// TODO: add observer to function

// TODO: install function and NPM dependencies

// ----------------------------------------------------------------------------
//
//  Interactive REPL.
//
// ----------------------------------------------------------------------------

const startInteractive = async () => {
  await initialize();
  const INPUT_PROMPT = "$ ";

  const stdin = process.openStdin();
  process.stdout.write(INPUT_PROMPT);

  stdin.addListener("data", async data => {
    console.log(data.toString());
    const { fname, finput } = parse(data.toString());
    const output = await evaluate(fname, finput);
    console.info(output);
    process.stdout.write(INPUT_PROMPT);
  });

  process.on("SIGINT", () => {
    console.info("Got SIGINT.  Going to exit.");
    queue.emit(`gesso:exit:${__host__.id}`, {
      id: __host__.id
    });
    queue.quit();
    process.kill(process.pid);
  });
};

// ----------------------------------------------------------------------------
//
//  Pipe (process.stdin).
//
// ----------------------------------------------------------------------------

const startWithPipe = async () => {
  await initialize();

  const stdin = process.stdin;
  let data = "";
  stdin.setEncoding("utf8");
  stdin.on("data", chunk => {
    data += chunk;
  });
  stdin.on("end", async () => {
    const sanitized = data.trim();
    const { fname, finput } = parse(sanitized);
    setTimeout(async () => {
      const output = await evaluate(fname, finput);
      process.stdout.write(JSON.stringify(output));
      process.exit(0);
    });
  });
  stdin.on("error", console.error);
};

// ----------------------------------------------------------------------------
//
//  CLI.
//
// ----------------------------------------------------------------------------

const startWithOptions = async () => {
  await initialize();

  // TODO: Parse options and compose into input object
  // const input = parseInput();
  const { fname, finput } = parse(process.argv.slice(2));
  console.log("options:");
  console.log(fname);
  console.log(finput);
  // const input = process.argv.slice(2).join(" ");
  // console.log(input);
  setTimeout(async () => {
    const output = await evaluate(fname, finput);
    console.log(`output: ${output}`);
    process.exit(0);
  }, 200);
};

const start = async () => {
  if (!process.stdin.isTTY) {
    return startWithPipe();
  }
  if (process.argv && process.argv.length > 2) {
    return startWithOptions();
  }
  return startInteractive();
};

// ----------------------------------------------------------------------------
//
//  Module.
//
// ----------------------------------------------------------------------------

if (require.main === module) {
  start();
} else {
  console.log("Importing Gesso as a Node module.");
}

module.exports.initialize = initialize;
module.exports.parse = parse;
module.exports.evaluate = evaluate;

module.exports.start = start;
module.exports.stop = stop;

// ----------------------------------------------------------------------------
//
//  HTTP.
//
// ----------------------------------------------------------------------------

// content of index.js
const http = require("http");
const httpPort = 8080;

const requestHandler = (request, response) => {
  console.log(request.url);
  if (request.url === "/gesso/functions") {
    // response.writeHead(200, {'Content-Type': 'text/html'});
    // response.write(request.url);
    // response.end();
    console.log("Sending functions in client response.");
    const functions = [];
    for (const fid of Object.keys(__functions__)) {
      const fn = __functions__[fid];
      functions.push(fn.manifest);
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.write(JSON.stringify(functions));
    response.end();
  } else {
    response.end("Gesso HTTP server accepting requests.");
  }
};

const httpServer = http.createServer(requestHandler);

httpServer.listen(httpPort, err => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${httpPort}`);
});

// ----------------------------------------------------------------------------
//
//  Demo (temporary).
//
// ----------------------------------------------------------------------------

// Returns a function module.
const get = ({ name, version }) => {
  for (const fid of Object.keys(__functions__)) {
    const fmodule = __functions__[fid];
    if (
      fmodule.manifest.name === name &&
      fmodule.manifest.version === version
    ) {
      // const output = await new fmodule.Function().execute(message.input);
      return fmodule;
    }
  }
  console.log(`Function "${name}" ${version} not found.`);
};

module.exports.fn = get;
