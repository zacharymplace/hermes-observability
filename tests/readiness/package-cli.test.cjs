#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");

const result = spawnSync(
  process.execPath,
  [
    path.join(
      root,
      "packages",
      "readiness",
      "bin",
      "hermes-readiness.cjs"
    )
  ],
  {
    cwd: root,
    encoding: "utf8"
  }
);

assert.strictEqual(result.status, 0);

assert.ok(
  result.stdout.includes("Hermes readiness status: PASS")
);

assert.ok(
  fs.existsSync(
    path.join(
      root,
      "reports",
      "readiness",
      "latest-readiness.json"
    )
  )
);

console.log("Hermes readiness package CLI test passed.");
