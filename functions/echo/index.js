// const gesso = require("@gesso");
// class Function extends gesso.Function {

class Function {
  constructor() {}

  execute(input) {
    // console.log(`ECHO: ${input}`)
    // no return
    return input;
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