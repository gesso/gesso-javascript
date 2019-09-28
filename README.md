# Gesso

Tool for fast interactive buildling.

<!--
Configures, adapts, and extends to meet needs.
-->

<!--
RFC and frameworks for programming systems from commands to the intergalactic.
-->

## Features

- Use in multiple ways
  - CLI with arguments (supports piped input)
  - REPL
  - Piped I/O
  - `require` or `import` as module
- Compatibility
  - Supports any `npm` module
- Quick
  - Graphical application composition
  - Automated `npm` package managemnt for Gesso functions
- Configurable
  - Configure Gesso shell to customize the developer experience
- Extensible
  - Custom command parsers with middleware
- Deployable
  - Remove developer Gesso functions to package application for deployment
- Integrations
  - Visual Studio Code extension (WIP)

## Installation

`gesso` can install and run _Gesso functions_. The functions installed in a
_Gesso workspace_ define the capabilities of `gesso`.

To boostrap `gesso` for developing applications, run the following commands:

```
gesso install @gesso/function # Installs the default Gesso function.
gesso install @gesso/new      # Installs the "new" command to create functions.
gesso install @gesso/package  # Installs the "package" command to package applications.
```

## Usage

### Interactive (REPL)

Running `gesso` with no arguments and no piped input runs Gesso in interactive
mode. Interactive mode is essentialy a REPL.

Run `gesso` to open Gesso in interactive mode which presents an input prompt:

```
$ echo "Hello"
Hello
$ text-to-speech "Hello there"
```

### CLI

`gesso` and each `gesso-function` can be run from the command line.

#### Example: Echo input

```
gesso echo hello
```

#### Example: Generate a UUID

```
gesso echo uuid-generator
```

#### Example: Text to speech (single argument)

```
gesso text-to-speech "Hello from Gesso."
```

#### Example: Text to speech (explicit arguments)

```
gesso text-to-speech --input.text "Hello from Gesso."
```

#### Example: Text to speech (multiple explicit arguments)

```
gesso text-to-speech --input.text "Hello from Gesso." --input.voice Alex
```

#### Example: Text to speech (multiple explicit arguments with simplified syntax)

Input arguments can be specified without the `input.` prefix when only `input`
arguments are specified.

```
gesso text-to-speech --text "Hello from Gesso." --voice Alex
```

### Piping input and output

#### Example: Pipe a command and arguments

```
echo "echo hello" | gesso
```

#### Example: Pipe arguments and specify command as an argument

```
echo "hello" | gesso echo
```

### HTTP API

TBD. Optional?

### Editor

TBD. Optional?

### Notebook

TBD. Optional?

## 

## Package an application

To deploy, just remove the `functions/init`, `functions/new`, `functions/edit`,
and `functions/install` functions (makes read-only).

Gesso editing functions can be reinstalled by anyone that checks out the
project, so they're considered reserved folder names (defined in default
`gesso.json` file).

## Deploy

Gesso can run on one or more machines (i.e., a cluster).