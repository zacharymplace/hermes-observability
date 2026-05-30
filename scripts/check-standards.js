const fs = require("fs");

const files = [
  "standards/events.json",
  "standards/scores.json",
  "standards/disposition.json",
];

for (const file of files) {
  JSON.parse(fs.readFileSync(file, "utf8"));
}

console.log("Hermes observability standards valid");
