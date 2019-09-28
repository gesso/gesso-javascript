const uuid = require("uuid")
// TODO: const uuid = gesso("uuid")

class Function {
  constructor() {}

  execute() {
    return uuid.v4();
  }
}

if (require.main === module) {
  if (process.argv) {
    const fn = new Function();
    const output = fn.execute();
    console.info(output);
    // execute(process.argv)
  }
}

module.exports.Function = Function;

module.exports.manifest = require("./manifest.json")