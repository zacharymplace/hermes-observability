#!/usr/bin/env node

const assert = require("assert");
const { validateReadiness, buildMarkdown } = require("../../lib/readiness");

const standard = {
  version: "0.1.0",
  requiredTraceFields: ["trace_id", "run_id"],
  recommendedTraceFields: ["model"],
  privacyDefaults: {
    allowRawPromptLogging: false,
    allowRawCompletionLogging: false,
    requireRedaction: true,
    requireSensitiveFieldList: true
  },
  artifactMetadata: ["schema_version", "run_id"]
};

const validTrace = {
  trace_id: "trace_1",
  run_id: "run_1",
  model: "demo",
  privacy: {
    allowRawPromptLogging: false,
    allowRawCompletionLogging: false,
    redactionEnabled: true,
    sensitiveFields: ["token"]
  },
  artifact: {
    schema_version: "0.1.0",
    run_id: "run_1"
  }
};

function testValidTracePasses() {
  const result = validateReadiness({ standard, trace: validTrace });
  assert.strictEqual(result.status, "pass");
  assert.strictEqual(result.summary.fail, 0);
  assert.strictEqual(result.summary.warn, 0);
}

function testMissingRequiredFails() {
  const trace = { ...validTrace };
  delete trace.trace_id;

  const result = validateReadiness({ standard, trace });
  assert.strictEqual(result.status, "fail");
  assert.ok(result.findings.some((finding) => finding.id === "missing_required_trace_field:trace_id"));
}

function testRecommendedWarnsOnly() {
  const trace = { ...validTrace };
  delete trace.model;

  const result = validateReadiness({ standard, trace });
  assert.strictEqual(result.status, "pass");
  assert.strictEqual(result.summary.warn, 1);
  assert.ok(result.findings.some((finding) => finding.id === "missing_recommended_trace_field:model"));
}

function testMarkdownRendersFindings() {
  const report = {
    status: "fail",
    generated_at: "2026-05-31T00:00:00.000Z",
    summary: { fail: 1, warn: 0 },
    fixture: "fixture.json",
    standard_version: "0.1.0",
    findings: [
      {
        id: "missing_required_trace_field:trace_id",
        severity: "fail",
        message: "Missing required trace field: trace_id"
      }
    ]
  };

  const markdown = buildMarkdown(report);
  assert.ok(markdown.includes("Status: **FAIL**"));
  assert.ok(markdown.includes("missing_required_trace_field:trace_id"));
}

function main() {
  testValidTracePasses();
  testMissingRequiredFails();
  testRecommendedWarnsOnly();
  testMarkdownRendersFindings();

  console.log("Hermes readiness module tests passed.");
}

main();
