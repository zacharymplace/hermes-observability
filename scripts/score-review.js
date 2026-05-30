function scoreReview(results) {
  const total = results.length || 1;
  const failed = results.filter((result) => result.status !== "pass");
  const passed = total - failed.length;

  const readiness = Number((passed / total).toFixed(2));
  const risk = Number((failed.length / total).toFixed(2));
  const confidence = Number((readiness * (1 - risk)).toFixed(2));

  const reasonCodes = [];
  if (failed.length === 0) reasonCodes.push("all_checks_passed");
  if (failed.length > 0) reasonCodes.push("one_or_more_checks_failed");

  if (results.some((result) => result.command.includes("release-check") && result.status === "pass")) {
    reasonCodes.push("release_check_passed");
  }

  if (results.some((result) => result.command.includes("npm run check") && result.status === "pass")) {
    reasonCodes.push("repo_check_passed");
  }

  if (results.some((result) => result.command.includes("ci:summary") && result.status === "pass")) {
    reasonCodes.push("ci_summary_available");
  }

  let recommendation = "hold";
  if (readiness >= 0.9 && risk <= 0.1) recommendation = "promote";
  else if (readiness >= 0.75 && risk <= 0.25) recommendation = "watch";

  return {
    readiness,
    risk,
    confidence,
    recommendation,
    reason_codes: reasonCodes
  };
}

module.exports = { scoreReview };
