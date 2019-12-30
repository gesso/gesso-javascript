const fs = require("fs");
const os = require("os");
const uuid = require("uuid");

// command: "gesso install"
// description: create ~/.gesso.json
class Function {
  constructor() {}

  execute(input) {
    console.info("INIT")
    // Create `~/.gesso` direcotry in current home directory.
    const gessoHome = `${os.homedir()}/.gesso`;
    fs.mkdirSync(gessoHome, {
      recursive: true
    });

    // Write `~/.gesso/config.json` configuration file.
    let { config } = input;
    if (!config) {
      config = {
        id: uuid.v4()
      };
    }
    let formatted = JSON.stringify(config, null, 2);
    const gessoFile = `${os.homedir()}/.gesso/config.json`;
    fs.writeFileSync(gessoFile, formatted);
    console.info(`Wrote "~/.gesso.json" file.`);
  }
}

// if (require.main === module) {
//   // TODO: Support piped output by default.
//   if (process.argv) {
//     const fn = new Function();
//     const output = await fn.execute();
//     console.info(output);
//   }
// }

module.exports.Function = Function;

module.exports.manifest = require("./manifest.json.js.js");
