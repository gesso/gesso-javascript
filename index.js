const uuid = require("uuid");

const DISABLE_LOGGING = false;

const print = (levels => {
  return ["info", "debug", "warn", "log", "error"].reduce((printer, level) => {
    printer[level] = message =>
      DISABLE_LOGGING || (levels && !levels.includes(level))
        ? {}
        : console[level](message);
    return printer;
  }, {});
})(["info"]);

const gessoList = () => {
  for (const fid of Object.keys(__functions__)) {
    print.info(
      `${__functions__[fid].manifest.name}\t${__functions__[fid].manifest.version}\t${__functions__[fid].manifest.id}`
    );
  }
};

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

const __host__ = {
  id: __config__.id
};

const __hosts__ = {};

const __functions__ = {};

const __observers__ = {};

const __inputs__ = {};

const __context__ = {};

const queue = (() => {
  const NRP = require("node-redis-pubsub");
  const nrp = new NRP(__config__.dispatcher.io.redis);
  return {
    on: (...args) => nrp.on(...args),
    emit: (...args) => nrp.emit(...args),
    quit: (...args) => nrp.quit(...args)
  };
})();

const authenticate = () => {
  print.debug("Authenticating");

  if (!__host__.id) {
    print.info(`mode: ephemeral`);
  }
  __host__.id = uuid.v4();
  __host__.dir = process.cwd();

  __hosts__[__host__.id] = __host__;
};

const index = () => {
  const fs = require("fs");

  const fdirs = fs
    .readdirSync(`${__host__.dir}/functions`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  print.info("fdirs:");
  print.info(fdirs);

  const fignore = (() => {
    try {
      return require(`${__host__.dir}/.gessoignore.json`);
    } catch (err) {
      print.debug(".gessoignore.json not found");
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
      print.info(`checking "${fmanifest.name}" ${fmanifest.version}`);
      if (fignore && fignore[fmanifest.name]) {
        if (fignore[fmanifest.name] === fmanifest.version) {
          print.info(`ignoring ${fmanifest.name} ${fmanifest.version}`);
          continue;
        } else {
          print.info(`keeping ${fmanifest.name} ${fmanifest.version}`);
        }
        // else "installing ${fmanifest.name}"
      }
      // print.info(`importing "${fmanifest.name}" ${fmanifest.version}`);
      fnames.push(fmanifest.name);
    } catch (err) {
      print.error(`$corrupt function "{fdir}"`);
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

const initialize = () => {
  authenticate();

  const { fnames, fhosts } = index();
  print.info("fnames:");
  print.info(fnames);

  connect();

  queue.emit(`gesso:host:${__host__.id}`, __host__);
};

const connect = fid => {
  if (fid) {
    if (__functions__[fid]) {
      queue.on(`gesso:function:${fid}`, consume(fid));
    }
  } else {
    for (const fid of Object.keys(__functions__)) {
      queue.on(`gesso:function:${fid}`, consume(fid));
    }
  }
};

queue.on(`gesso:host:*`, async host => {
  print.debug(`host: ${host.id}`);
  const ok = {
    id: __host__.id
  };
  queue.emit(`gesso:ok:${host.id}`, ok);
});

queue.on(`gesso:ok:${__host__.id}`, async host => {
  print.debug(`ok: ${host.id}`);

  __hosts__[host.id] = host;
});

queue.on(`gesso:exit:*`, async host => {
  print.debug(`host ${host.id} left`);
  delete __hosts__[host.id];
});

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
  print.debug(`dispatch ${fid}`);
  for await (const oid of __observers__[fid]) {
    await emit(oid, input);
  }
};

const emit = async (fid, input) => {
  print.debug(`emit ${fid}`);

  const contextId = uuid.v4();
  const context = {
    startTime: Date.now()
  };
  print.debug(`context: ${contextId}`);
  print.debug(context);

  const promise = new Promise((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });
  __context__[contextId] = context;

  const channel = `gesso:context:${contextId}`;
  print.debug(`subscribe ${channel}`);
  const unsubscribe = queue.on(channel, output => {
    const hasResponse = unsubscribe(() => {
      print.debug(`unsubscribe ${channel}`);
    });
    print.debug(`has response: ${hasResponse}`);
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

const processInput = async (fname, finput) => {
  const output = await evaluateInput(fname, finput);
  return output;
};

const parseInput = input => {
  return input.toString().trim();
};

const evaluateInput = async (fname, finput) => {
  // TODO: Validate function name.
  // Validate input for function.
  if (!finput || finput.length <= 0) {
    print.info(`no input`);
    return;
  }
  print.info(`input:`);
  print.info(finput);

  if (finput === "list") {
    return gessoList();
  }
  if (finput === "edit") {
    return gessoEdit();
  }

  // Emit input to function.
  for await (const fid of Object.keys(__functions__)) {
    if (__functions__[fid].manifest.name === fname) {
      // TODO: If the function isn't yet connected, this will fail... handle that case.
      const context = await emit(fid, finput);
      const output = context.output;
      return output;
    }
  }
};

const runInteractive = async () => {
  await initialize();

  const stdin = process.openStdin();
  process.stdout.write("$ ");

  stdin.addListener("data", async data => {
    console.log(data.toString());
    const { fname, finput } = parseOptions(data.toString());
    const output = await processInput(fname, finput);
    print.info(output);
    process.stdout.write("$ ");
  });

  process.on("SIGINT", () => {
    print.info("Got SIGINT.  Going to exit.");
    queue.emit(`gesso:exit:${__host__.id}`, {
      id: __host__.id
    });
    queue.quit();
    process.kill(process.pid);
  });
};

// Parse arguments and create input object.
const parseOptions = require("./parser").parse;

const runWithPipe = async () => {
  await initialize();

  const stdin = process.stdin;
  let data = "";
  stdin.setEncoding("utf8");
  stdin.on("data", chunk => {
    data += chunk;
  });
  stdin.on("end", async () => {
    const sanitized = data.trim();
    const { fname, finput } = parseOptions(sanitized);
    setTimeout(async () => {
      const output = await processInput(fname, finput);
      process.stdout.write(JSON.stringify(output));
      process.exit(0);
    });
  });
  stdin.on("error", console.error);
};

const runWithOptions = async () => {
  await initialize();

  // TODO: Parse options and compose into input object
  // const input = parseInput();
  const { fname, finput } = parseOptions(process.argv.slice(2));
  console.log("options:");
  console.log(fname);
  console.log(finput);
  // const input = process.argv.slice(2).join(" ");
  // console.log(input);
  setTimeout(async () => {
    const output = await processInput(fname, finput);
    console.log(`output: ${output}`);
    process.exit(0);
  }, 200);
};

if (require.main === module) {
  print.debug(`command line arguments: ${process.argv.length}`);
  const hasPipeInput = !process.stdin.isTTY;
  const hasArguments = process.argv && process.argv.length > 2;
  if (hasPipeInput) {
    runWithPipe();
  }
  if (hasArguments) {
    runWithOptions();
  }
  if (!hasPipeInput && !hasArguments) {
    runInteractive();
  }
} else {
  console.log("Importing Gesso as a Node module.");
}

module.exports.initialize = initialize;
// module.exports.parse = parseInput;
module.exports.input = processInput;
