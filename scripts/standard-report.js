const fs = require("fs");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const events = readJson("standards/events.json");
const scores = readJson("standards/scores.json");
const disposition = readJson("standards/disposition.json");

console.log("Hermes Observability Standard Report");
console.log("====================================");
console.log(`Version: ${events.version}`);
console.log("");

console.log(`Events (${events.events.length})`);
for (const event of events.events) {
  const metadata = Array.isArray(event.requiredMetadata)
    ? event.requiredMetadata.join(", ")
    : "none";

  console.log(`- ${event.name}`);
  console.log(`  requiredMetadata: ${metadata}`);
}

console.log("");
console.log(`Scores (${scores.scores.length})`);
for (const score of scores.scores) {
  console.log(`- ${score.name}`);
  console.log(`  range: ${score.range.join("..")}`);
  console.log(`  meaning: ${score.meaning}`);
}

console.log("");
console.log("Recommendations");
for (const [name, rule] of Object.entries(disposition.recommendations)) {
  console.log(`- ${name}`);
  console.log(`  readinessMin: ${rule.readinessMin}`);
  console.log(`  riskMax: ${rule.riskMax}`);
}

console.log("");
console.log(`Reason Codes (${disposition.reasonCodes.length})`);
for (const reasonCode of disposition.reasonCodes) {
  console.log(`- ${reasonCode}`);
}
