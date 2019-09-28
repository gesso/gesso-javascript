process.stdin.resume();
process.stdin.setEncoding("utf8");

let input = "";

const execute = async (input) => {
  // console.log(`Executing function ${process.pid} with input: ${input}`)
  return Promise.resolve(parseInt(input.trim()));
}

process.stdin.on("data", function(data) {
  input += data;
  // process.stdout.write(data);
});

process.stdin.on("end", async function() {
  const fs = require("fs");
  const output = await execute(input);
  const arguments = process.argv.slice(2);
  const addend = parseInt(arguments[0]) || 1;
  const stdoutLogFile = fs.createWriteStream('./stdout.log');
  const stderrLogFile = fs.createWriteStream('./stderr.log');
  const logger = new console.Console({ stdout: stdoutLogFile, stderr: stderrLogFile });
  logger.log("foo")
  process.stdout.write(JSON.stringify(output + addend));
})
