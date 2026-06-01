const {
  checkRequiredFields,
  checkRecommendedFields,
  checkPrivacyDefaults,
  checkArtifactMetadata
} = require("./checks.cjs");

function validateReadiness({ standard, trace }) {
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

  return {
    status: summary.fail === 0 ? "pass" : "fail",
    summary,
    findings
  };
}

module.exports = {
  validateReadiness
};
