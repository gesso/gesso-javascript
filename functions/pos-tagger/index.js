// const natural = require("natural");
// const lexicon = require("../node_modules/natural/lib/natural/brill_pos_tagger/data/English/lexicon_from_posjs.json")

// class Function {
//   constructor() {}

//   execute(input) {
//     // console.log(">>> input: " + input.sentence)
//     const language = "EN";
//     const defaultCategory = "N";
//     const defaultCategoryCapitalized = "NNP";

//     const lexicon = new natural.Lexicon(
//       language,
//       defaultCategory,
//       defaultCategoryCapitalized
//     );
//     const ruleSet = new natural.RuleSet("EN");
//     const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

//     const sentence = ["I", "see", "the", "man", "with", "the", "telescope"];
//     // const sentence = input.sentence.split(" ");
//     console.log(tagger.tag(sentence));
    
//     return tagger.tag(sentence);
//   }
// }

// if (require.main === module) {
//   if (process.argv) {
//     const fn = new Function();
//     fn.execute();
//     // execute(process.argv)
//   }
// }

// module.exports.Function = Function

// module.exports.manifest = require("./manifest.json")

const afinn = require("afinn-165");

class Function {
  constructor() {}

  execute(input) {
    console.log("GOT INPUT")
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
