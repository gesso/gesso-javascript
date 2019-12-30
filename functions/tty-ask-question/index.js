const inquirer = require("inquirer");
const chalkPipe = require("chalk-pipe");

const questions = [
  {
    type: "input",
    name: "first_name",
    message: "What's your first name"
  },
  {
    type: "input",
    name: "last_name",
    message: "What's your last name",
    default: function() {
      return "Doe";
    }
  },
  {
    type: "input",
    name: "fav_color",
    message: "What's your favorite color",
    transformer: function(color, answers, flags) {
      const text = chalkPipe(color)(color);
      if (flags.isFinal) {
        return text + "!";
      }

      return text;
    }
  },
  {
    type: "input",
    name: "phone",
    message: "What's your phone number",
    validate: function(value) {
      var pass = value.match(
        /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
      );
      if (pass) {
        return true;
      }

      return "Please enter a valid phone number";
    }
  }
];

class Function {
  constructor() {}

  async execute(input) {
    const answers = await inquirer.prompt(questions)
    console.log(JSON.stringify(answers, null, "  "));
    return answers;
    // .then(answers => {
    //   console.log(JSON.stringify(answers, null, "  "));
    // });
    console.log(JSON.stringify(answers, null, "  "));
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
