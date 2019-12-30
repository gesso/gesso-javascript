// const stdoutLogFile = fs.createWriteStream('./stdout.log');
// const stderrLogFile = fs.createWriteStream('./stderr.log');
// const logger = new console.Console({ stdout: stdoutLogFile, stderr: stderrLogFile });

const DISABLE_LOGGING = false;

// const print = (levels => {
//   return ["info", "debug", "warn", "log", "error"].reduce((printer, level) => {
//     printer[level] = message =>
//       DISABLE_LOGGING || (levels && !levels.includes(level))
//         ? {}
//         : console[level](message);
//     return printer;
//   }, {});
// })(["info"]);

/*
["log", "warn", "error"].forEach(function(method) {
  const methods = console[method].bind(console);
  console[method] = function() {
    methods.apply(console, [new Date().toISOString()].concat(arguments));
  };
});
*/

// const initialize = (console, options) => {
// const methods = ["log", "warn", "error", "info"];
// methods.forEach(method => {
//   const consoleFunction = console[method].bind(console);
//   console[method] = () => {
//     consoleFunction.apply(
//       console,
//       [new Date().toISOString()].concat(arguments)
//     );
//   };
// });
// };

// module.exports.initialize = initialize;
module.exports.DISABLE_LOGGING = DISABLE_LOGGING;
module.exports = console;
