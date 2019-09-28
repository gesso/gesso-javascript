const npm = require("npm");

npm.load(err => {
  // handle errors

  // install module ffi
  // TODO: check if the package is already installed
  npm.commands.install(["@gesso/function"], (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // log errors or data
    console.log(data);
    const _ = require("lodash");
    const list = [1, 2, 3, 4];
    _.each(list, item => {
      console.log(item);
    });
  });

  // npm.commands.ls([], (er, data) => {
  //   // log errors or data
  //   console.log(JSON.stringify(data));
  // });

  npm.on("log", (message) => {
    // log installation progress
    console.log(message);
  });
});
