const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const outputPath = path.join("dist", "hermes-observability-standard.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const report = execFileSync(
  process.execPath,
  ["scripts/standard-report.js", "--json"],
  { encoding: "utf8" }
);

JSON.parse(report);

fs.writeFileSync(outputPath, report.endsWith("\n") ? report : `${report}\n`);

console.log(`Hermes observability standard exported: ${outputPath}`);
