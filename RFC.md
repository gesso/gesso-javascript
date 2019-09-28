# RFC

## Function hosting and invocation

Functions are indexed and made available for calling with the following methods:

- native `emit` and `listen`
- UDP sockets and message passing (LAN, method 1)
- Redis pubsub (LAN/WAN, method 2)

## Interfaces

- Command line interface (CLI)
- Interactive (REPL)
- HTTP
- `require` or `import` as a Node module
- Run each Gesso function as a CLI tool with optional piped I/O