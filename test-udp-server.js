const GESSO_UDP_PORT = 33333;
const GESSO_UDP_HOST = "127.0.0.1";

const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("error", err => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("listening", () => {
  const address = server.address();
  console.log(
    "UDP Server listening on " + address.address + ":" + address.port
  );
});

server.on("message", (message, remote) => {
  console.log(remote.address + ":" + remote.port + " - " + message);
});

server.bind(GESSO_UDP_PORT, GESSO_UDP_HOST);
