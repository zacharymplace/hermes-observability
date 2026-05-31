const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const outputPath = path.join("dist", "hermes-observability-standard.json");

const expected = execFileSync(
  process.execPath,
  ["scripts/standard-report.js", "--json"],
  { encoding: "utf8" }
);

if (!fs.existsSync(outputPath)) {
  throw new Error(`${outputPath} is missing. Run npm run standard:export.`);
}

const actual = fs.readFileSync(outputPath, "utf8");

const normalizedExpected = expected.endsWith("\n") ? expected : `${expected}\n`;

if (actual !== normalizedExpected) {
  throw new Error(`${outputPath} is stale. Run npm run standard:export and commit the result.`);
}

console.log(`Hermes observability standard export is current: ${outputPath}`);
