const afinn = require("afinn-165");

class Function {
  constructor() {}

  execute(input) {
    const words = Object.keys(afinn);
    const randomIndex = parseInt(Math.random() * (words.length - 1));
    return words[randomIndex];
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