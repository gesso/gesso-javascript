const fs = require("fs");
const os = require("os");
const uuid = require("uuid");

const indexFunctions = () => {
  // Read host.
  const __host__ = {};
  __host__.dir = process.cwd();

  const __functions__ = {};

  const fdirs = fs
    .readdirSync(`${__host__.dir}/functions`, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  console.info("fdirs:");
  console.info(fdirs);

  const fignore = (() => {
    try {
      return require(`${__host__.dir}/.gessoignore.json`);
    } catch (err) {
      console.debug(".gessoignore.json not found");
      return;
    }
  })();

  // Apply `.gessoignore`.
  const fnames = [];
  for (const fdir of fdirs) {
    try {
      const fmodule = require(`${__host__.dir}/functions/${fdir}`);
      const fmanifest = fmodule.manifest;
      // check gesso function
      console.info(`checking "${fmanifest.name}" ${fmanifest.version}`);
      if (fignore && fignore[fmanifest.name]) {
        if (fignore[fmanifest.name] === fmanifest.version) {
          console.info(`ignoring ${fmanifest.name} ${fmanifest.version}`);
          continue;
        } else {
          console.info(`keeping ${fmanifest.name} ${fmanifest.version}`);
        }
        // else "installing ${fmanifest.name}"
      }
      // console.info(`importing "${fmanifest.name}" ${fmanifest.version}`);
      fnames.push(fmanifest.name);
    } catch (err) {
      console.error(`$corrupt function "{fdir}"`);
    }
  }

  // Initialize functions.
  for (const fname of fnames) {
    const fmodule = require(`${__host__.dir}/functions/${fname}`);
    const fmanifest = fmodule.manifest;
    __functions__[fmanifest.id] = fmodule;
  }

  return __functions__;
};

class Function {
  constructor() {}

  execute(input) {
    const __functions__ = indexFunctions();
    for (const fid of Object.keys(__functions__)) {
      console.info(
        `${__functions__[fid].manifest.name}\t${__functions__[fid].manifest.version}\t${__functions__[fid].manifest.id}`
      );
    }
  }
}

// if (require.main === module) {
//   // TODO: Support piped output by default.
//   if (process.argv) {
//     const fn = new Function();
//     // const output = await fn.execute();
//     const output = fn.execute();
//     console.info(output);
//   }
// }

module.exports.Function = Function;

module.exports.manifest = require("./manifest.json");
