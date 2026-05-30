const fs = require("fs");

const specs = [
  {
    file: "standards/events.json",
    itemKey: "events",
    requiredItemFields: ["name"],
  },
  {
    file: "standards/scores.json",
    itemKey: "scores",
    requiredItemFields: ["name"],
  },
  {
    file: "standards/disposition.json",
    itemKey: "dispositions",
    requiredItemFields: ["name"],
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const spec of specs) {
  const parsed = JSON.parse(fs.readFileSync(spec.file, "utf8"));

  assert(
    Object.hasOwn(parsed, spec.itemKey),
    `${spec.file} missing top-level field: ${spec.itemKey}`
  );

  const items = parsed[spec.itemKey];

  assert(Array.isArray(items), `${spec.file}.${spec.itemKey} must be an array`);
  assert(items.length > 0, `${spec.file}.${spec.itemKey} must not be empty`);

  const names = new Set();

  for (const [index, item] of items.entries()) {
    assert(item && typeof item === "object" && !Array.isArray(item), `${spec.file}.${spec.itemKey}[${index}] must be an object`);

    for (const field of spec.requiredItemFields) {
      assert(Object.hasOwn(item, field), `${spec.file}.${spec.itemKey}[${index}] missing field: ${field}`);
      assert(typeof item[field] === "string" && item[field].trim().length > 0, `${spec.file}.${spec.itemKey}[${index}].${field} must be a non-empty string`);
    }

    assert(!names.has(item.name), `${spec.file}.${spec.itemKey} duplicate name: ${item.name}`);
    names.add(item.name);
  }
}

console.log("Hermes observability standard shapes valid");
