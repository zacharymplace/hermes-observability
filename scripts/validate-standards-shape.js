const fs = require("fs");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertVersion(parsed, file) {
  assert(typeof parsed.version === "string" && parsed.version.trim(), `${file}.version must be a non-empty string`);
}

function assertNamedArray(parsed, file, key, requiredFields = []) {
  assert(Object.hasOwn(parsed, key), `${file} missing top-level field: ${key}`);

  const items = parsed[key];

  assert(Array.isArray(items), `${file}.${key} must be an array`);
  assert(items.length > 0, `${file}.${key} must not be empty`);

  const names = new Set();

  for (const [index, item] of items.entries()) {
    assert(item && typeof item === "object" && !Array.isArray(item), `${file}.${key}[${index}] must be an object`);
    assert(typeof item.name === "string" && item.name.trim(), `${file}.${key}[${index}].name must be a non-empty string`);

    for (const field of requiredFields) {
      assert(Object.hasOwn(item, field), `${file}.${key}[${index}] missing field: ${field}`);
    }

    assert(!names.has(item.name), `${file}.${key} duplicate name: ${item.name}`);
    names.add(item.name);
  }
}

const events = readJson("standards/events.json");
assertVersion(events, "standards/events.json");
assertNamedArray(events, "standards/events.json", "events", ["requiredMetadata"]);

const scores = readJson("standards/scores.json");
assertVersion(scores, "standards/scores.json");
assertNamedArray(scores, "standards/scores.json", "scores", ["range", "meaning"]);

for (const [index, score] of scores.scores.entries()) {
  assert(Array.isArray(score.range), `standards/scores.json.scores[${index}].range must be an array`);
  assert(score.range.length === 2, `standards/scores.json.scores[${index}].range must have 2 values`);
  assert(score.range.every((value) => typeof value === "number"), `standards/scores.json.scores[${index}].range values must be numbers`);
}

const disposition = readJson("standards/disposition.json");
assertVersion(disposition, "standards/disposition.json");

assert(
  disposition.recommendations && typeof disposition.recommendations === "object" && !Array.isArray(disposition.recommendations),
  "standards/disposition.json.recommendations must be an object"
);

for (const name of ["promote", "watch", "hold"]) {
  const rule = disposition.recommendations[name];
  assert(rule && typeof rule === "object", `standards/disposition.json.recommendations.${name} must be an object`);
  assert(typeof rule.readinessMin === "number", `standards/disposition.json.recommendations.${name}.readinessMin must be a number`);
  assert(typeof rule.riskMax === "number", `standards/disposition.json.recommendations.${name}.riskMax must be a number`);
}

assert(Array.isArray(disposition.reasonCodes), "standards/disposition.json.reasonCodes must be an array");
assert(disposition.reasonCodes.length > 0, "standards/disposition.json.reasonCodes must not be empty");

const reasonCodes = new Set();
for (const [index, reasonCode] of disposition.reasonCodes.entries()) {
  assert(typeof reasonCode === "string" && reasonCode.trim(), `standards/disposition.json.reasonCodes[${index}] must be a non-empty string`);
  assert(!reasonCodes.has(reasonCode), `standards/disposition.json.reasonCodes duplicate: ${reasonCode}`);
  reasonCodes.add(reasonCode);
}

console.log("Hermes observability standard shapes valid");
