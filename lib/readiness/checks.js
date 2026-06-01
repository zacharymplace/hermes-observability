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

module.exports = {
  checkRequiredFields,
  checkRecommendedFields,
  checkPrivacyDefaults,
  checkArtifactMetadata
};
