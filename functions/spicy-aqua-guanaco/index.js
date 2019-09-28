class Function {
  constructor() {}

  execute(input) {
    const filePath = input.filePath;
    console.log(`writing gessofile`)
    // no return
  }
}

if (require.main === module) {
  if (process.argv) {
    const fn = new Function();
    const output = fn.execute();
    console.info(output);
    // TODO: Write to pipe output.
  }
}

module.exports.Function = Function;

module.exports.manifest = require("./manifest.json")