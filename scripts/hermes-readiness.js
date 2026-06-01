#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  parseArgs,
  readJson,
  buildMarkdown,
  validateReadiness
} = require("../lib/readiness");

const root = process.cwd();

function main() {
  const cliOptions = parseArgs(process.argv, root);

  const standardPath = cliOptions.standard;
  const fixturePath = cliOptions.fixture;
  const jsonReportPath = cliOptions.outJson;
  const markdownReportPath = cliOptions.outMd;
  const reportsDir = path.dirname(jsonReportPath);

  const standard = readJson(standardPath);
  const trace = readJson(fixturePath);
  const validation = validateReadiness({ standard, trace });

  const report = {
    schema_version: "0.1.0",
    tool_version: "hermes-observability@0.1.0",
    generated_at: new Date().toISOString(),
    status: validation.status,
    standard_version: standard.version,
    fixture: path.relative(root, fixturePath),
    summary: validation.summary,
    checks: {
      requiredTraceFields: standard.requiredTraceFields || [],
      recommendedTraceFields: standard.recommendedTraceFields || [],
      privacyDefaults: standard.privacyDefaults || {},
      artifactMetadata: standard.artifactMetadata || []
    },
    findings: validation.findings
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
