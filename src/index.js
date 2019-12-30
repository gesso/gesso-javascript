// (() => {
//   const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
//   arr.reverse();
//   const used = process.memoryUsage().heapUsed / 1024 / 1024;
//   console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
//   const available = process.memoryUsage().heapTotal;
//   console.log(`Memory used: ${used}`)
//   console.log(`Memory available: ${available}`)
// })();

// (() => {
//   const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
//   arr.reverse();
//   const used = process.memoryUsage().heapUsed / 1024 / 1024;
//   console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
//   const available = process.memoryUsage().heapTotal;
//   console.log(`Memory used: ${used}`)
//   console.log(`Memory available: ${available}`)
// })();

require("./gesso").start();

// const gesso = require("./gesso");

// // ----------------------------------------------------------------------------
// //
// //  Interactive REPL.
// //
// // ----------------------------------------------------------------------------

// const startInteractive = async () => {
//   await gesso.initialize();
//   const INPUT_PROMPT = "$ ";

//   const stdin = process.openStdin();
//   process.stdout.write(INPUT_PROMPT);

//   stdin.addListener("data", async data => {
//     console.log(data.toString());
//     const { fname, finput } = gesso.parse(data.toString());
//     const output = await gesso.evaluate(fname, finput);
//     console.info(output);
//     process.stdout.write(INPUT_PROMPT);
//   });

//   process.on("SIGINT", () => {
//     console.info("Got SIGINT.  Going to exit.");
//     gesso.stop();
//     process.kill(process.pid);
//   });
// };

// // ----------------------------------------------------------------------------
// //
// //  Pipe (process.stdin).
// //
// // ----------------------------------------------------------------------------

// const startWithPipe = async () => {
//   await initialize();

//   const stdin = process.stdin;
//   let data = "";
//   stdin.setEncoding("utf8");
//   stdin.on("data", chunk => {
//     data += chunk;
//   });
//   stdin.on("end", async () => {
//     const sanitized = data.trim();
//     const { fname, finput } = parse(sanitized);
//     setTimeout(async () => {
//       const output = await evaluate(fname, finput);
//       process.stdout.write(JSON.stringify(output));
//       process.exit(0);
//     });
//   });
//   stdin.on("error", console.error);
// };

// // ----------------------------------------------------------------------------
// //
// //  CLI.
// //
// // ----------------------------------------------------------------------------

// const startWithOptions = async () => {
//   await initialize();

//   // TODO: Parse options and compose into input object
//   // const input = parseInput();
//   const { fname, finput } = parse(process.argv.slice(2));
//   console.log("options:");
//   console.log(fname);
//   console.log(finput);
//   // const input = process.argv.slice(2).join(" ");
//   // console.log(input);
//   setTimeout(async () => {
//     const output = await evaluate(fname, finput);
//     console.log(`output: ${output}`);
//     process.exit(0);
//   }, 200);
// };

// const start = async () => {
//   if (!process.stdin.isTTY) {
//     return startWithPipe();
//   }
//   if (process.argv && process.argv.length > 2) {
//     return startWithOptions();
//   }
//   return startInteractive();
// }

// if (require.main === module) {
//   start(); 
// } else {
//   console.log("Importing Gesso as a Node module.");
// }