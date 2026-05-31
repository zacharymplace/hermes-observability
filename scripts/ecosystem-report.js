const fs = require("fs");
const path = require("path");
const { execSync } = require("node:child_process");

const sourceStandardPath = path.resolve("dist/hermes-observability-standard.json");
const outputDir = path.resolve("reports");
const jsonPath = path.join(outputDir, "ecosystem-report.json");
const mdPath = path.join(outputDir, "ecosystem-report.md");

const repos = [
  { name: "ops-clarity-sprint", path: path.join(process.env.HOME, "dev/ops-clarity-sprint"), traceScript: "scripts/langfuse-review-trace.js" },
  { name: "ufc-decision-service", path: path.join(process.env.HOME, "dev/ufc-decision-service"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "civic-league", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/civic-league"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "host-aware-abundance", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/host-aware-abundance"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "mirrorwall", path: path.join(process.env.HOME, "dev/mirrorwall"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "ai-ops-console", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/ai-ops-console"), traceScript: "scripts/langfuse-review-trace.cjs" },
];

function run(command, cwd) {
  try {
    return {
      ok: true,
      output: execSync(command, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        env: {
          ...process.env,
          HERMES_OBSERVABILITY_STANDARD_PATH: sourceStandardPath,
        },
      }).trim(),
    };
  } catch (error) {
    return {
      ok: false,
      output: String(error.stdout || error.stderr || error.message).trim(),
    };
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeJson(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function scriptsFor(repoPath) {
  const pkgPath = path.join(repoPath, "package.json");
  if (!fs.existsSync(pkgPath)) return {};
  return readJson(pkgPath).scripts || {};
}

function ensureNodeDependencies(repoPath) {
  const pkgPath = path.join(repoPath, "package.json");
  const lockPath = path.join(repoPath, "package-lock.json");
  const modulesPath = path.join(repoPath, "node_modules");
  const allowInstall = process.env.HERMES_ECOSYSTEM_INSTALL_DEPS === "1";

  if (!fs.existsSync(pkgPath)) return { ok: true, action: "no_package_json" };
  if (fs.existsSync(modulesPath)) return { ok: true, action: "already_present" };

  if (!allowInstall) {
    return {
      ok: false,
      action: "missing_node_modules_install_skipped",
      output: "Missing node_modules. Set HERMES_ECOSYSTEM_INSTALL_DEPS=1 to allow ecosystem report to install downstream dependencies.",
    };
  }

  const installCommand = fs.existsSync(lockPath) ? "npm ci" : "npm install";
  const install = run(installCommand, repoPath);

  return {
    ok: install.ok,
    action: installCommand,
    output: install.output,
  };
}

function latestCiLine(repoPath) {
  const npmSummary = run("npm run ci:summary", repoPath);
  if (npmSummary.ok) return npmSummary.output.split("\n").find((line) => /completed \| success/.test(line)) || npmSummary.output.split("\n")[0] || "";

  const shellSummary = run("bash scripts/github-ci-summary.sh", repoPath);
  if (shellSummary.ok) return shellSummary.output.split("\n").find((line) => /completed \| success/.test(line)) || shellSummary.output.split("\n")[0] || "";

  return npmSummary.output || shellSummary.output || "";
}

function gitValue(repoPath, command, fallback = "unknown") {
  const result = run(command, repoPath);
  return result.ok ? result.output : fallback;
}

function extractBalancedJsonObject(output, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < output.length; index += 1) {
    const char = output[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") depth += 1;

    if (char === "}") {
      depth -= 1;
      if (depth === 0) return output.slice(start, index + 1);
    }
  }

  return null;
}

function parseObservedTraceReview(output) {
  const starts = [];

  for (let index = 0; index < output.length; index += 1) {
    if (output[index] === "{") starts.push(index);
  }

  for (const start of starts.reverse()) {
    const candidate = extractBalancedJsonObject(output, start);
    if (!candidate) continue;

    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && parsed.score) {
        return parsed;
      }
    } catch {
      // Keep walking backward until a valid JSON review payload is found.
    }
  }

  return null;
}

function possibleReasonCodes(traceText) {
  return [...new Set(
    [...traceText.matchAll(/reasonCodes\.push\("([^"]+)"\)/g)].map((match) => match[1])
  )].sort();
}

function inspectRepo(repo, sourceStandard) {
  const repoPath = repo.path;
  const localStandardPath = path.join(repoPath, "docs/hermes-observability-standard.json");
  const traceScriptPath = path.join(repoPath, repo.traceScript);
  const exists = fs.existsSync(repoPath);
  const scripts = exists ? scriptsFor(repoPath) : {};

  const localStandardExists = exists && fs.existsSync(localStandardPath);
  const localStandardMatches = localStandardExists
    ? normalizeJson(readJson(localStandardPath)) === normalizeJson(sourceStandard)
    : false;

  const standardVerify = scripts["hermes:standard:verify"]
    ? run("npm run hermes:standard:verify", repoPath)
    : { ok: false, output: "missing script" };

  const traceText = fs.existsSync(traceScriptPath) ? fs.readFileSync(traceScriptPath, "utf8") : "";
  const metadata = {
    repo: traceText.includes("repo"),
    branch: traceText.includes("branch"),
    commit: traceText.includes("commit"),
    environment: traceText.includes("environment"),
    standard_version: traceText.includes("standard_version"),
    trace_type: traceText.includes("trace_type"),
    review: traceText.includes('trace_type: "review"'),
  };

  const status = exists ? run("git status --short --branch", repoPath) : { ok: false, output: "missing repo" };
  const dirty = status.output.split("\n").slice(1).some(Boolean);

  const ciLine = exists ? latestCiLine(repoPath) : "";

  const dependencyInstall = ensureNodeDependencies(repoPath);

  let traceReviewCommand = "none";
  let traceReview = { ok: false, output: dependencyInstall.output || "" };

  if (!dependencyInstall.ok) {
    traceReviewCommand = dependencyInstall.action;
  } else if (scripts["trace:review"]) {
    traceReviewCommand = "npm run trace:review";
    traceReview = run(traceReviewCommand, repoPath);
  } else if (scripts["hermes:observe"]) {
    traceReviewCommand = "npm run hermes:observe";
    traceReview = run(traceReviewCommand, repoPath);
  }

  const observedTraceReview = traceReview.ok ? parseObservedTraceReview(traceReview.output) : null;
  const observedScore = observedTraceReview?.score || {};
  const reasonCodes = Array.isArray(observedScore.reason_codes)
    ? [...new Set(observedScore.reason_codes)].sort()
    : [];
  const possibleReasonCodesList = traceText ? possibleReasonCodes(traceText) : [];

  const healthChecks = [
    exists,
    localStandardExists,
    localStandardMatches,
    Boolean(scripts["hermes:standard:verify"]),
    Boolean(scripts["hermes:observe"]),
    standardVerify.ok,
    fs.existsSync(traceScriptPath),
    ...Object.values(metadata),
    !dirty,
    /completed \| success/.test(ciLine),
  ];

  const failedChecks = healthChecks.filter((item) => !item).length;
  const health = failedChecks === 0 ? "pass" : failedChecks <= 2 ? "watch" : "hold";

  return {
    name: repo.name,
    path: repo.path,
    branch: exists ? gitValue(repoPath, "git rev-parse --abbrev-ref HEAD") : "missing",
    commit: exists ? gitValue(repoPath, "git rev-parse --short HEAD") : "missing",
    health,
    failedChecks,
    localStandardExists,
    localStandardMatches,
    hasStandardVerify: Boolean(scripts["hermes:standard:verify"]),
    hasObserve: Boolean(scripts["hermes:observe"]),
    standardVerifyPasses: standardVerify.ok,
    traceScriptExists: fs.existsSync(traceScriptPath),
    metadata,
    workingTreeClean: !dirty,
    latestCiSuccess: /completed \| success/.test(ciLine),
    latestCiLine: ciLine,
    reasonCodes,
    possibleReasonCodes: possibleReasonCodesList,
    traceReviewPasses: traceReview.ok,
    traceReviewCommand,
    dependencyInstallAction: dependencyInstall.action,
    dependencyInstallPasses: dependencyInstall.ok,
    traceReviewOutputTail: String(traceReview.output || "").slice(-4000),
    traceReviewParseStatus: observedTraceReview ? "parsed" : "not_parsed",
    latestRecommendation: observedScore.recommendation || "unknown",
    readiness: typeof observedScore.readiness === "number" ? observedScore.readiness : null,
    risk: typeof observedScore.risk === "number" ? observedScore.risk : null,
    confidence: typeof observedScore.confidence === "number" ? observedScore.confidence : null,
    reviewStatus: observedTraceReview?.status || "unknown",
  };
}

function markdown(report) {
  const lines = [];

  lines.push("# Hermes Langfuse Ecosystem Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Source standard version: ${report.sourceStandardVersion}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Repos: ${report.summary.total}`);
  lines.push(`- Pass: ${report.summary.pass}`);
  lines.push(`- Watch: ${report.summary.watch}`);
  lines.push(`- Hold: ${report.summary.hold}`);
  lines.push(`- Stale standards: ${report.summary.staleStandards}`);
  lines.push(`- Dirty working trees: ${report.summary.dirtyWorkingTrees}`);
  lines.push("");
  lines.push("## Repo Health");
  lines.push("");
  lines.push("| Repo | Health | Recommendation | Readiness | Risk | Branch | Commit | Standard | Metadata | CI | Clean |");
  lines.push("|---|---:|---:|---:|---:|---|---|---:|---:|---:|---:|");

  for (const repo of report.repos) {
    const metadataOk = Object.values(repo.metadata).every(Boolean);
    lines.push(`| ${repo.name} | ${repo.health} | ${repo.latestRecommendation} | ${repo.readiness ?? "n/a"} | ${repo.risk ?? "n/a"} | ${repo.branch} | ${repo.commit} | ${repo.localStandardMatches ? "pass" : "fail"} | ${metadataOk ? "pass" : "fail"} | ${repo.latestCiSuccess ? "pass" : "fail"} | ${repo.workingTreeClean ? "pass" : "fail"} |`);
  }


  lines.push("");
  lines.push("## Review Outcomes");
  lines.push("");
  lines.push("| Repo | Trace Review | Recommendation | Readiness | Risk | Confidence |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const repo of report.repos) {
    lines.push(`| ${repo.name} | ${repo.traceReviewPasses ? "pass" : "fail"} | ${repo.latestRecommendation} | ${repo.readiness ?? "n/a"} | ${repo.risk ?? "n/a"} | ${repo.confidence ?? "n/a"} |`);
  }
  lines.push("");
  lines.push("## Reason Code Rollup");
  lines.push("");
  for (const [code, count] of Object.entries(report.reasonCodeRollup).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    lines.push(`- ${code}: ${count}`);
  }


  lines.push("");
  lines.push("## Trace Review Parse Diagnostics");
  lines.push("");
  lines.push("| Repo | Dependency Action | Dependency Status | Command | Command Status | Parse Status | Output Tail |");
  lines.push("|---|---|---:|---|---:|---:|---|");
  for (const repo of report.repos) {
    const tail = String(repo.traceReviewOutputTail || "")
      .replace(/\n/g, "<br>")
      .replace(/\|/g, "\\|")
      .slice(-500);
    lines.push(`| ${repo.name} | ${repo.dependencyInstallAction || "n/a"} | ${repo.dependencyInstallPasses ? "pass" : "fail"} | ${repo.traceReviewCommand || "n/a"} | ${repo.traceReviewPasses ? "pass" : "fail"} | ${repo.traceReviewParseStatus || "unknown"} | ${tail || "n/a"} |`);
  }
  lines.push("");
  lines.push("## Latest CI");
  lines.push("");
  for (const repo of report.repos) {
    lines.push(`- ${repo.name}: ${repo.latestCiLine || "n/a"}`);
  }

  return lines.join("\n") + "\n";
}

if (!fs.existsSync(sourceStandardPath)) {
  console.error(`Source standard missing: ${sourceStandardPath}`);
  process.exit(1);
}

const sourceStandard = readJson(sourceStandardPath);
const inspected = repos.map((repo) => inspectRepo(repo, sourceStandard));

const reasonCodeRollup = {};
for (const repo of inspected) {
  for (const code of repo.reasonCodes) {
    reasonCodeRollup[code] = (reasonCodeRollup[code] || 0) + 1;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceStandardPath,
  sourceStandardVersion: sourceStandard.version,
  summary: {
    total: inspected.length,
    pass: inspected.filter((repo) => repo.health === "pass").length,
    watch: inspected.filter((repo) => repo.health === "watch").length,
    hold: inspected.filter((repo) => repo.health === "hold").length,
    staleStandards: inspected.filter((repo) => !repo.localStandardMatches).length,
    dirtyWorkingTrees: inspected.filter((repo) => !repo.workingTreeClean).length,
  },
  reasonCodeRollup,
  repos: inspected,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(mdPath, markdown(report));

console.log(`Ecosystem report written: ${jsonPath}`);
console.log(`Ecosystem report written: ${mdPath}`);
console.log(`Health: pass=${report.summary.pass} watch=${report.summary.watch} hold=${report.summary.hold}`);
