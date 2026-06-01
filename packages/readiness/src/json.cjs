const fs = require("fs");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}: ${error.message}`);
  }
}

module.exports = {
  readJson
};
