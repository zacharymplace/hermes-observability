#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const standardPath = path.join(root, "standards", "readiness.json");
const fixturePath = path.join(root, "fixtures", "readiness", "valid-agent-trace.json");
const reportsDir = path.join(root, "reports", "readiness");
const jsonReportPath = path.join(reportsDir, "latest-readiness.json");
const markdownReportPath = path.join(reportsDir, "latest-readiness.md");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}: ${error.message}`);
  }
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function checkRequiredFields(trace, requiredFields) {
  return requiredFields
    .filter((field) => !hasOwn(trace, field) || trace[field] === null || trace[field] === "")
    .map((field) => ({
      id: `missing_required_trace_field:${field}`,
      severity: "fail",
      message: `Missing required trace field: ${field}`
    }));
}

function checkRecommendedFields(trace, recommendedFields) {
  return recommendedFields
    .filter((field) => !hasOwn(trace, field) || trace[field] === null || trace[field] === "")
    .map((field) => ({
      id: `missing_recommended_trace_field:${field}`,
      severity: "warn",
      message: `Missing recommended trace field: ${field}`
    }));
}

function checkPrivacyDefaults(trace, defaults) {
  const findings = [];
  const privacy = trace.privacy || {};

  if (privacy.allowRawPromptLogging !== defaults.allowRawPromptLogging) {
    findings.push({
      id: "privacy_raw_prompt_logging",
      severity: "fail",
      message: "Raw prompt logging must be disabled by default."
    });
  }

  if (privacy.allowRawCompletionLogging !== defaults.allowRawCompletionLogging) {
    findings.push({
      id: "privacy_raw_completion_logging",
      severity: "fail",
      message: "Raw completion logging must be disabled by default."
    });
  }

  if (defaults.requireRedaction && privacy.redactionEnabled !== true) {
    findings.push({
      id: "privacy_redaction_required",
      severity: "fail",
      message: "Redaction must be enabled."
    });
  }

  if (
    defaults.requireSensitiveFieldList &&
    (!Array.isArray(privacy.sensitiveFields) || privacy.sensitiveFields.length === 0)
  ) {
    findings.push({
      id: "privacy_sensitive_fields_required",
      severity: "fail",
      message: "Sensitive field list is required."
    });
  }

  return findings;
}

function checkArtifactMetadata(trace, metadataFields) {
  const artifact = trace.artifact || {};
  return metadataFields
    .filter((field) => !hasOwn(artifact, field) || artifact[field] === null || artifact[field] === "")
    .map((field) => ({
      id: `missing_artifact_metadata:${field}`,
      severity: "fail",
      message: `Missing artifact metadata field: ${field}`
    }));
}

function buildMarkdown(report) {
  const failCount = report.summary.fail;
  const warnCount = report.summary.warn;
  const passIcon = report.status === "pass" ? "PASS" : "FAIL";

  const findingRows = report.findings.length
    ? report.findings.map((finding) => `- **${finding.severity.toUpperCase()}** ${finding.id}: ${finding.message}`).join("\n")
    : "- No findings.";

  return `# Hermes Agent/MCP Observability Readiness Report

Status: **${passIcon}**

Generated at: ${report.generated_at}

## Summary

- Failures: ${failCount}
- Warnings: ${warnCount}
- Fixture: \`${report.fixture}\`
- Standard version: \`${report.standard_version}\`

## Checks

- Required trace metadata
- Recommended trace metadata
- Privacy-safe logging defaults
- Artifact metadata envelope
- JSON report generation
- Markdown report generation

## Findings

${findingRows}

## Next Actions

${report.status === "pass"
  ? "- Pilot this readiness check against ai-ops-console and ops-clarity-sprint."
  : "- Fix failing readiness findings before piloting this check downstream."}
`;
}

function main() {
  const standard = readJson(standardPath);
  const trace = readJson(fixturePath);

  const findings = [
    ...checkRequiredFields(trace, standard.requiredTraceFields || []),
    ...checkRecommendedFields(trace, standard.recommendedTraceFields || []),
    ...checkPrivacyDefaults(trace, standard.privacyDefaults || {}),
    ...checkArtifactMetadata(trace, standard.artifactMetadata || [])
  ];

  const summary = {
    fail: findings.filter((finding) => finding.severity === "fail").length,
    warn: findings.filter((finding) => finding.severity === "warn").length
  };

  const report = {
    schema_version: "0.1.0",
    tool_version: "hermes-observability@0.1.0",
    generated_at: new Date().toISOString(),
    status: summary.fail === 0 ? "pass" : "fail",
    standard_version: standard.version,
    fixture: path.relative(root, fixturePath),
    summary,
    checks: {
      requiredTraceFields: standard.requiredTraceFields || [],
      recommendedTraceFields: standard.recommendedTraceFields || [],
      privacyDefaults: standard.privacyDefaults || {},
      artifactMetadata: standard.artifactMetadata || []
    },
    findings
  };

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownReportPath, buildMarkdown(report));

  console.log(`Hermes readiness status: ${report.status.toUpperCase()}`);
  console.log(`JSON report: ${path.relative(root, jsonReportPath)}`);
  console.log(`Markdown report: ${path.relative(root, markdownReportPath)}`);

  if (report.status !== "pass") {
    process.exitCode = 1;
  }
}

main();
