class Function {
  constructor() {}

  execute(input) {
    console.log("GOT INPUT")
    const length = input.length;
    return length;
    // const randomNumber = parseInt(Math.random() * 100);
    // return randomNumber;
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