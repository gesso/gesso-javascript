const Function = require("./fn").Function;

if (require.main === module) {
  const hasPipeInput = !process.stdin.isTTY;
  const hasArguments = process.argv && process.argv.length > 2;
  if (hasPipeInput) {
    // runWithPipe();
    // const stdin = process.stdin;
    // let data = "";
    // stdin.setEncoding("utf8");
    // stdin.on("data", chunk => {
    //   data += chunk;
    // });
    // stdin.on("end", async () => {
    //   const sanitized = data.trim();
    //   const { fname, finput } = parseOptions(sanitized);
    //   setTimeout(async () => {
    //     const output = await processInput(fname, finput);
    //     process.stdout.write(JSON.stringify(output));
    //     process.exit(0);
    //   });
    // });
    // stdin.on("error", console.error);
  }
  if (hasArguments) {
    // runWithOptions();
    const fn = new Function();
    const output = fn.execute({ text: process.argv[2] });
    console.info(output);
  }
  if (!hasPipeInput && !hasArguments) {
    // runInteractive();
  }
}

module.exports.Function = Function;

module.exports.manifest = require("./manifest.json");
