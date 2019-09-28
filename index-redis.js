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
  print.debug("fdirs:");
  print.debug(fdirs);

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
    const fn = __functions__[fid];
    const output = await new fn.Function().execute(message.input);

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

  return promise;
};

const processInput = async input => {
  const parsed = parseInput(input);
  const output = await evaluateInput(parsed);
  return output;
};

const parseInput = input => {
  return input.toString().trim();
};

const evaluateInput = async input => {
  if (!input || input.length <= 0) {
    print.info(`no input`);
    return;
  }
  print.info(`input: ${input}`);

  if (input === "list") {
    return gessoList();
  }
  if (input === "edit") {
    return gessoEdit();
  }

  if (input && input.length > 0 && input !== "!") {
    const functionName = input.split(" ")[0];
    const functionInput = input.split(" ").slice(1);
    console.log("functionName: " + functionName);
    console.log("functionInput: " + functionInput);
    for await (const fid of Object.keys(__functions__)) {
      if (__functions__[fid].manifest.name === functionName) {
        console.log("function: " + fid);
        // TODO: If the function isn't yet connected, this will fail... handle that case.
        const context = await emit(fid, functionInput);
        const output = context.output;
        print.info(output);
      }
    }
  }

  if (input && input.length > 0 && input === "!") {
    print.debug(input);
    for await (const fid of Object.keys(__functions__)) {
      print.debug(fid);
      if (fid === "444e1e5ad06f448bb01d990db2f6b1c4") {
        continue;
      }
      const context = await emit(fid, input);
      const output = context.output;
      print.debug(`context: ${context.id}`);
      print.debug(context);
      print.debug(`output ${fid}:`);
      print.info(output);
    }
  } else {
  }
};

const prompt = async () => {
  await initialize();

  const stdin = process.openStdin();
  process.stdout.write("$ ");

  stdin.addListener("data", async data => {
    const output = await processInput(data);
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

if (require.main === module) {
  print.debug(`command line arguments: ${process.argv.length}`);
  print.debug("stdin:");

  const hasPipeInput = !process.stdin.isTTY;
  const hasArguments = process.argv && process.argv.length > 2;

  if (hasPipeInput) {
    const stdin = process.stdin;
    let data = "";
    stdin.setEncoding("utf8");
    stdin.on("data", chunk => {
      data += chunk;
    });
    stdin.on("end", async () => {
      print.debug("Hello " + data);
      // const output = evaluateInput(parseInput(input));
      const output = await processInput(data);
      process.stdout.write(JSON.stringify(output));
    });
    stdin.on("error", console.error);
  }

  if (hasArguments) {
    (async () => {
      await initialize();
      // TODO: Parse options and compose into input object
      // const input = parseInput();
      const input = process.argv.slice(2).join(" ");
      console.log(input);
      const output = await processInput(input);
      console.log(`output: ${output}`);
      process.exit(0);
    })();
  }

  if (!hasPipeInput && !hasArguments) {
    if (!process.argv[2]) {
      prompt();
    }
  }
} else {
  console.log("Importing Gesso as a Node module.");
}

module.exports.initialize = initialize;
module.exports.parse = parseInput;
module.exports.input = processInput;
