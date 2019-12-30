const tokenize = input => {
  if (!Array.isArray(input)) {
    const tokens = input.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);
    return tokens ? [...tokens.map(token => {
      if (token.length > 0 && token[0] === "\"") {
        token = token.substring(1);
      }
      if (token.length > 0 && token[token.length - 1] === "\"") {
        token = token.substring(0, token.length - 1);
      }
      return token;
    })] : [];
  }
  return [...input];
};

// Parse options and create input object.
const parse = options => {
  // console.debug("parsing options:");
  // console.debug(options);
  const finput = {};

  tokens = tokenize(options);

  // let hasError = false;
  let fname; // Function name.
  let pkey; // Property key.
  let pvalue; // Property value.
  for (let i = 0; i < tokens.length; i++) {
    // TODO: Handle "substr1 substr2" as single token
    // Pop next token.
    const token = tokens[i];
    // Extract command.
    if (i === 0 && token.indexOf("--") !== 0) {
      fname = token;
      // TODO: Decomose function in nested namespace (e.g., mgub.gesso.myFunction).
      // TODO: Make sure the command exists (or can be installed).
      continue;
    }
    // Extract property name.
    if (token.indexOf("--") === 0) {
      pkey = token.substring(2);
      // TODO: Validate pkey (must match function's input type).
      // TODO: Handle "-- -- --" case.

      // Assign default value if no value is given.
      if (i + 1 < tokens.length && tokens[i + 1].indexOf("--") !== 0) {
        pvalue = undefined; // Set default value.
        continue;
      }
    }

    // Parse nested object structure and extract value.
    if (pkey) {
      if (token.indexOf("--") !== 0) {
        pvalue = token;
      }

      let propertyNode = finput;
      let propertyPath = pkey.split("."); // e.g., input.text.font
      if (propertyPath[0] === "input") {
        propertyPath = propertyPath.slice(1);
      }
      while (propertyPath.length > 0) {
        const propertyName = propertyPath.shift();
        // console.log("POPPED: " + propertyPath)
        // if (object[propertyName] && object[propertyName] !== value) {
        //   console.log(object[propertyName])
        //   console.log(value)
        //   throw new Error(`Overwriting property ${property}.`);
        // }
        if (propertyPath.length > 0) {
          if (!propertyNode[propertyName]) {
            propertyNode[propertyName] = {};
          }
          propertyNode = propertyNode[propertyName];
        } else {
          propertyNode[propertyName] = pvalue;
        }
      }
      // Reset.
      pkey = undefined;
      pvalue = undefined;
      continue;
    }
  }

  return {
    fname,
    finput
  };
};

module.exports.parse = parse;