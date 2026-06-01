const path = require("path");

function parseArgs(argv, root) {
  const options = {
    standard: path.join(root, "standards", "readiness.json"),
    fixture: path.join(root, "fixtures", "readiness", "valid-agent-trace.json"),
    outJson: path.join(root, "reports", "readiness", "latest-readiness.json"),
    outMd: path.join(root, "reports", "readiness", "latest-readiness.md")
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--standard") {
      options.standard = path.resolve(root, value);
      index += 1;
    } else if (arg === "--fixture") {
      options.fixture = path.resolve(root, value);
      index += 1;
    } else if (arg === "--out-json") {
      options.outJson = path.resolve(root, value);
      index += 1;
    } else if (arg === "--out-md") {
      options.outMd = path.resolve(root, value);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

module.exports = {
  parseArgs
};
