const EventEmitter = require("events");

class FunctionEmitter extends EventEmitter {}

// const myEmitter = new MyEmitter();
// myEmitter.on('event', () => {
//   console.log('an event occurred!');
// });
// myEmitter.emit('event');

const functionEmitter = new FunctionEmitter();

// Only do this once so we don't loop forever
functionEmitter.once("newListener", (event, listener) => {
  if (event === "event") {
    // Insert a new listener in front
    functionEmitter.on("event", () => {
      console.log("B");
    });
  }
});

functionEmitter.on("event", () => {
  console.log("A");
});

functionEmitter.emit("event");
// Prints:
//   B
//   A
