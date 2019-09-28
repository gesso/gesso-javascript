const say = require("say"); // Automatically pick platform.

class Function {
  constructor() {}

  async execute(input) {
    const { text, voice = "Alex", speed = 1.0 } = input;
    // More complex example (with an OS X voice) and slow speed
    return new Promise((resolve, reject) => {
      say.speak(text, voice, speed, err => {
        if (err) {
          return console.error(err);
        }
        // TODO: Stream function stdout to calling context for logging (over network if needed).
        console.log("Text has been spoken.");
        resolve({ transcript: text });
      });
    });
  }
}

module.exports.Function = Function;