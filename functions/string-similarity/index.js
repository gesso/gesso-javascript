const stringSimilarity = require("string-similarity");
const afinn = require("afinn-165");

const getRandomWords = length => {
  const words = Object.keys(afinn);
  let randomWords = [];
  for (let count = 0; count < length; count++) {
    const randomIndex = parseInt(Math.random() * (words.length - 1));
    randomWords.push(words[randomIndex]);
  }
  return randomWords;
};

class Function {
  constructor() {}

  async execute(input) {
    // TODO: read a word from gesso.npm("lodash").each([1,2,3], number => console.log(number)) // make a little library that does this <-- mental model for gesso client library way of use (in config, define default export and possibly a shim to change the  way it's used / "controller+module" layer) // TODO: read a word from gesso.fn("string-similarity")
    // TODO: (?) read a word from gesso.io("")

    // TODO: read a random word via gesso from "random-word" (AS AN EXERCISE... IT SHOULD BE POSSIBLE, BUT USING NPM MODULES IS FINE ON THIS LEVEL - INCLUDE IN DOCUMENTATION... ILLUSTRATES WHAT THESE FUNCTIONS LOOK LIKE)
    const randomOtherWords = getRandomWords(10);
    // const matches = stringSimilarity.findBestMatch(input, randomOtherString);
    // return matches[0]; // try { word, similarity }
    const similarityScore = stringSimilarity.compareTwoStrings(
      input[0],
      randomOtherWords[1]
    );
    return similarityScore;
    // const matches = stringSimilarity.findBestMatch("healed", [
    //   "edward",
    //   "sealed",
    //   "theatre"
    // ]);
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

module.exports.manifest = require("./manifest.json");
