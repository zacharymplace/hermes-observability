#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  readJson,
  buildMarkdown,
  validateReadiness
} = require("../../../lib/readiness");

const packageRoot = path.resolve(__dirname, "..");
const root = process.cwd();

function parsePackageArgs(argv) {
  const options = {
    standard: path.join(packageRoot, "standards", "readiness.json"),
    fixture: path.join(packageRoot, "fixtures", "valid-agent-trace.json"),
    outJson: path.join(root, "reports", "readiness", "latest-readiness.json"),
    outMd: path.join(root, "reports", "readiness", "latest-readiness.md")
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--standard") {
      options.standard = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === "--fixture") {
      options.fixture = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === "--json-report" || arg === "--out-json") {
      options.outJson = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === "--markdown-report" || arg === "--out-md") {
      options.outMd = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return options;
}

const options = parsePackageArgs(process.argv.slice(2));

const standard = readJson(options.standard);
const trace = readJson(options.fixture);
const validation = validateReadiness({ standard, trace });

const report = {
  schema_version: "0.1.0",
  tool_version: "@hermes/readiness@0.1.0",
  generated_at: new Date().toISOString(),
  status: validation.status,
  standard_version: standard.version,
  fixture: path.relative(root, options.fixture),
  summary: validation.summary,
  checks: {
    requiredTraceFields: standard.requiredTraceFields || [],
    recommendedTraceFields: standard.recommendedTraceFields || [],
    privacyDefaults: standard.privacyDefaults || {},
    artifactMetadata: standard.artifactMetadata || []
  },
  findings: validation.findings
};

fs.mkdirSync(path.dirname(options.outJson), { recursive: true });
fs.mkdirSync(path.dirname(options.outMd), { recursive: true });
fs.writeFileSync(options.outJson, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(options.outMd, buildMarkdown(report));

console.log(`Hermes readiness status: ${report.status.toUpperCase()}`);
console.log(`JSON report: ${path.relative(root, options.outJson)}`);
console.log(`Markdown report: ${path.relative(root, options.outMd)}`);

if (report.status !== "pass") {
  process.exitCode = 1;
}
