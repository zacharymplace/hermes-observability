function buildMarkdown(report) {
  const failCount = report.summary.fail;
  const warnCount = report.summary.warn;
  const passIcon = report.status === "pass" ? "PASS" : "FAIL";

  const findingRows = report.findings.length
    ? report.findings
        .map((finding) => `- **${finding.severity.toUpperCase()}** ${finding.id}: ${finding.message}`)
        .join("\n")
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

${
  report.status === "pass"
    ? "- Pilot this readiness check against ai-ops-console and ops-clarity-sprint."
    : "- Fix failing readiness findings before piloting this check downstream."
}
`;
}

module.exports = {
  buildMarkdown
};
