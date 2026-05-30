const fs = require("fs");

const specs = [
  {
    file: "standards/events.json",
    requiredTopLevel: ["events"],
    requiredItemFields: ["name", "description"],
    itemKey: "events",
  },
  {
    file: "standards/scores.json",
    requiredTopLevel: ["scores"],
    requiredItemFields: ["name", "description", "range"],
    itemKey: "scores",
  },
  {
    file: "standards/disposition.json",
    requiredTopLevel: ["dispositions"],
    requiredItemFields: ["name", "description"],
    itemKey: "dispositions",
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const spec of specs) {
  const parsed = JSON.parse(fs.readFileSync(spec.file, "utf8"));

  for (const field of spec.requiredTopLevel) {
    assert(Object.hasOwn(parsed, field), `${spec.file} missing top-level field: ${field}`);
  }

  const items = parsed[spec.itemKey];
  assert(Array.isArray(items), `${spec.file}.${spec.itemKey} must be an array`);
  assert(items.length > 0, `${spec.file}.${spec.itemKey} must not be empty`);

  for (const [index, item] of items.entries()) {
    for (const field of spec.requiredItemFields) {
      assert(Object.hasOwn(item, field), `${spec.file}.${spec.itemKey}[${index}] missing field: ${field}`);
    }
  }
}

console.log("Hermes observability standard shapes valid");
