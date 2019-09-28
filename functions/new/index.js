const uuid = require("uuid");

class Function {
  constructor() {}

  execute(input) {
    const fs = require("fs");
    const {
      uniqueNamesGenerator: generateUniqueName
    } = require("unique-names-generator");
  
    const fname = generateUniqueName({ separator: "-", length: 3 });
    const fid = uuid.v4();
  
    // fs.mkdirSync(`${__host__.dir}/functions/${functionName}`, {
    fs.mkdirSync(`./functions/${fname}`, {
      recursive: true
    });
  
    let manifest = {
      id: fid,
      version: "0.0.0",
      name: fname
    };
    let formatted = JSON.stringify(manifest, null, 2);
  
    // const gessoFile = `${__host__.dir}/functions/${functionName}/manifest.json`;
    const gessoFile = `./functions/${fname}/manifest.json`;
    try {
      if (fs.existsSync(gessoFile)) {
        print.info(`local .gesso.json already exists`);
        return;
      }
    } catch (err) {
      console.error(err);
    }
  
    fs.writeFileSync(gessoFile, formatted);
  
    // const functionFile = `${__host__.dir}/functions/${functionName}/index.js`;
    const fpath = `./functions/${fname}/index.js`;
    const fcode =
      'class Function {\r\n  constructor() {}\r\n\r\n  execute(input) {\r\n    const filePath = input.filePath;\r\n    console.log(`writing gessofile`)\r\n    // no return\r\n  }\r\n}\r\n\r\nif (require.main === module) {\r\n  if (process.argv) {\r\n    const fn = new Function();\r\n    const output = fn.execute();\r\n    console.info(output);\r\n    // TODO: Write to pipe output.\r\n  }\r\n}\r\n\r\nmodule.exports.Function = Function;\r\n\r\nmodule.exports.manifest = require("./manifest.json")';
    fs.writeFileSync(fpath, fcode);
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