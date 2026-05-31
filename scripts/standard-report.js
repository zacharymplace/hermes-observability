const fs = require("fs");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const events = readJson("standards/events.json");
const scores = readJson("standards/scores.json");
const disposition = readJson("standards/disposition.json");
const traceMetadata = readJson("standards/trace-metadata.json");

const report = {
  version: events.version,
  counts: {
    events: events.events.length,
    scores: scores.scores.length,
    recommendations: Object.keys(disposition.recommendations).length,
    reasonCodes: disposition.reasonCodes.length,
  },
  events: events.events,
  scores: scores.scores,
  recommendations: disposition.recommendations,
  reasonCodes: disposition.reasonCodes,
  traceMetadata: traceMetadata.traceMetadata,
  traceTypes: traceMetadata.traceTypes,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("Hermes Observability Standard Report");
console.log("====================================");
console.log(`Version: ${report.version}`);
console.log("");

console.log(`Events (${report.counts.events})`);
for (const event of report.events) {
  const metadata = Array.isArray(event.requiredMetadata)
    ? event.requiredMetadata.join(", ")
    : "none";

  console.log(`- ${event.name}`);
  console.log(`  requiredMetadata: ${metadata}`);
}

console.log("");
console.log(`Scores (${report.counts.scores})`);
for (const score of report.scores) {
  console.log(`- ${score.name}`);
  console.log(`  range: ${score.range.join("..")}`);
  console.log(`  meaning: ${score.meaning}`);
}

console.log("");
console.log(`Recommendations (${report.counts.recommendations})`);
for (const [name, rule] of Object.entries(report.recommendations)) {
  console.log(`- ${name}`);
  console.log(`  readinessMin: ${rule.readinessMin}`);
  console.log(`  riskMax: ${rule.riskMax}`);
}

console.log("");
console.log(`Reason Codes (${report.counts.reasonCodes})`);
for (const reasonCode of report.reasonCodes) {
  console.log(`- ${reasonCode}`);
}


if (!process.argv.includes("--json")) {
  console.log("");
  console.log("Trace Metadata");
  console.log(`- required: ${traceMetadata.traceMetadata.required.join(", ")}`);
  console.log(`- optional: ${traceMetadata.traceMetadata.optional.join(", ")}`);

  console.log("");
  console.log(`Trace Types (${traceMetadata.traceTypes.length})`);
  for (const traceType of traceMetadata.traceTypes) {
    console.log(`- ${traceType}`);
  }
}
