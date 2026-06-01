#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..", "..");
const readinessScript = path.join(root, "scripts", "hermes-readiness.js");
const standardPath = path.join(root, "standards", "readiness.json");
const outputDir = path.join(root, "tmp", "readiness-tests");

function runReadiness(fixtureName) {
  const fixturePath = path.join(root, "tests", "fixtures", "readiness", fixtureName);
  const outJson = path.join(outputDir, `${fixtureName}.json`);
  const outMd = path.join(outputDir, `${fixtureName}.md`);

  fs.mkdirSync(outputDir, { recursive: true });

  const result = spawnSync(
    process.execPath,
    [
      readinessScript,
      "--standard",
      standardPath,
      "--fixture",
      fixturePath,
      "--out-json",
      outJson,
      "--out-md",
      outMd
    ],
    {
      cwd: root,
      encoding: "utf8"
    }
  );

  const report = fs.existsSync(outJson)
    ? JSON.parse(fs.readFileSync(outJson, "utf8"))
    : null;

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    report,
    outJson,
    outMd
  };
}

function findingIds(report) {
  return (report.findings || []).map((finding) => finding.id);
}

function testValidFixturePasses() {
  const result = runReadiness("../../../fixtures/readiness/valid-agent-trace.json");
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.strictEqual(result.report.status, "pass");
  assert.strictEqual(result.report.summary.fail, 0);
  assert.strictEqual(result.report.summary.warn, 0);
  assert.ok(fs.existsSync(result.outJson), "expected JSON report");
  assert.ok(fs.existsSync(result.outMd), "expected Markdown report");
}

function testMissingRequiredTraceFieldFails() {
  const result = runReadiness("missing-required-trace-field.json");
  assert.notStrictEqual(result.status, 0, "expected failure exit code");
  assert.strictEqual(result.report.status, "fail");
  assert.ok(findingIds(result.report).includes("missing_required_trace_field:trace_id"));
}

function testUnsafePrivacyDefaultsFail() {
  const result = runReadiness("unsafe-privacy-defaults.json");
  assert.notStrictEqual(result.status, 0, "expected failure exit code");
  const ids = findingIds(result.report);
  assert.ok(ids.includes("privacy_raw_prompt_logging"));
  assert.ok(ids.includes("privacy_raw_completion_logging"));
  assert.ok(ids.includes("privacy_redaction_required"));
  assert.ok(ids.includes("privacy_sensitive_fields_required"));
}

function testMissingArtifactMetadataFails() {
  const result = runReadiness("missing-artifact-metadata.json");
  assert.notStrictEqual(result.status, 0, "expected failure exit code");
  const ids = findingIds(result.report);
  assert.ok(ids.includes("missing_artifact_metadata:tool_version"));
  assert.ok(ids.includes("missing_artifact_metadata:run_id"));
  assert.ok(ids.includes("missing_artifact_metadata:generated_at"));
}

function main() {
  fs.rmSync(outputDir, { recursive: true, force: true });

  testValidFixturePasses();
  testMissingRequiredTraceFieldFails();
  testUnsafePrivacyDefaultsFail();
  testMissingArtifactMetadataFails();

  console.log("Hermes readiness validator tests passed.");
}

main();
