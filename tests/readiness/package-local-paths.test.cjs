#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const tmpRoot = path.join(repoRoot, "tmp", "package-local-paths-test");
const outJson = path.join(tmpRoot, "reports", "readiness", "latest-readiness.json");
const outMd = path.join(tmpRoot, "reports", "readiness", "latest-readiness.md");

fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

const result = childProcess.spawnSync(
  process.execPath,
  [
    path.join(repoRoot, "packages", "readiness", "bin", "hermes-readiness.cjs"),
    "--json-report",
    outJson,
    "--markdown-report",
    outMd
  ],
  {
    cwd: tmpRoot,
    encoding: "utf8"
  }
);

assert.strictEqual(result.status, 0, result.stderr || result.stdout);
assert.ok(fs.existsSync(outJson), "Expected package CLI to write JSON report.");
assert.ok(fs.existsSync(outMd), "Expected package CLI to write Markdown report.");

const report = JSON.parse(fs.readFileSync(outJson, "utf8"));

assert.strictEqual(report.status, "pass");
assert.strictEqual(
  report.fixture,
  path.relative(tmpRoot, path.join(repoRoot, "packages", "readiness", "fixtures", "valid-agent-trace.json"))
);

console.log("Hermes readiness package-local path test passed.");
