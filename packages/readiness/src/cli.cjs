const fs = require("fs");
const path = require("path");

const {
  parseArgs,
  readJson,
  buildMarkdown,
  validateReadiness
} = require("./index.cjs");

function run(argv = process.argv, cwd = process.cwd()) {
  const cliOptions = parseArgs(argv, cwd);

  const standard = readJson(cliOptions.standard);
  const trace = readJson(cliOptions.fixture);

  const validation = validateReadiness({
    standard,
    trace
  });

  const report = {
    schema_version: "0.1.0",
    tool_version: "@hermes/readiness@0.1.0",
    generated_at: new Date().toISOString(),
    status: validation.status,
    standard_version: standard.version,
    fixture: path.relative(cwd, cliOptions.fixture),
    summary: validation.summary,
    checks: {
      requiredTraceFields: standard.requiredTraceFields || [],
      recommendedTraceFields: standard.recommendedTraceFields || [],
      privacyDefaults: standard.privacyDefaults || {},
      artifactMetadata: standard.artifactMetadata || []
    },
    findings: validation.findings
  };

  fs.mkdirSync(path.dirname(cliOptions.outJson), { recursive: true });

  fs.writeFileSync(
    cliOptions.outJson,
    JSON.stringify(report, null, 2) + "\n"
  );

  fs.writeFileSync(
    cliOptions.outMd,
    buildMarkdown(report)
  );

  console.log(
    `Hermes readiness status: ${report.status.toUpperCase()}`
  );

  console.log(
    `JSON report: ${path.relative(cwd, cliOptions.outJson)}`
  );

  console.log(
    `Markdown report: ${path.relative(cwd, cliOptions.outMd)}`
  );

  if (report.status !== "pass") {
    process.exitCode = 1;
  }

  return report;
}

module.exports = {
  run
};
