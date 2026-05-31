const fs = require("fs");
const path = require("path");
const { execSync } = require("node:child_process");

const sourceStandardPath = path.resolve("dist/hermes-observability-standard.json");

const repos = [
  { name: "ops-clarity-sprint", path: path.join(process.env.HOME, "dev/ops-clarity-sprint"), traceScript: "scripts/langfuse-review-trace.js" },
  { name: "ufc-decision-service", path: path.join(process.env.HOME, "dev/ufc-decision-service"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "civic-league", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/civic-league"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "host-aware-abundance", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/host-aware-abundance"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "mirrorwall", path: path.join(process.env.HOME, "dev/mirrorwall"), traceScript: "scripts/langfuse-review-trace.cjs" },
  { name: "ai-ops-console", path: path.join(process.env.HOME, "dev/_archived_mac_duplicates_2026-05-27/ai-ops-console"), traceScript: "scripts/langfuse-review-trace.cjs" },
];

const requiredTraceMetadata = [
  "repo",
  "branch",
  "commit",
  "environment",
  "standard_version",
  "trace_type",
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

function check(condition, label, details = "") {
  return { status: condition ? "PASS" : "FAIL", label, details };
}

function scriptsFor(repoPath) {
  const pkgPath = path.join(repoPath, "package.json");
  if (!fs.existsSync(pkgPath)) return {};
  return readJson(pkgPath).scripts || {};
}

function latestCiSummary(repoPath) {
  const npmSummary = run("npm run ci:summary", repoPath);
  if (npmSummary.ok) return npmSummary.output;

  const shellSummary = run("bash scripts/github-ci-summary.sh", repoPath);
  if (shellSummary.ok) return shellSummary.output;

  return npmSummary.output || shellSummary.output;
}

function auditRepo(repo) {
  const results = [];
  const repoPath = repo.path;
  const localStandardPath = path.join(repoPath, "docs/hermes-observability-standard.json");
  const traceScriptPath = path.join(repoPath, repo.traceScript);
  const scripts = fs.existsSync(repoPath) ? scriptsFor(repoPath) : {};

  results.push(check(fs.existsSync(repoPath), "repo path exists", repoPath));
  if (!fs.existsSync(repoPath)) return results;

  results.push(check(fs.existsSync(localStandardPath), "local standard exists", localStandardPath));

  if (fs.existsSync(localStandardPath) && fs.existsSync(sourceStandardPath)) {
    const local = readJson(localStandardPath);
    const source = readJson(sourceStandardPath);
    results.push(check(
      normalizeJson(local) === normalizeJson(source),
      "local standard matches source export",
      localStandardPath
    ));
  }

  results.push(check(Boolean(scripts["hermes:standard:verify"]), "script hermes:standard:verify exists"));
  results.push(check(Boolean(scripts["hermes:observe"]), "script hermes:observe exists"));

  if (scripts["hermes:standard:verify"]) {
    const verify = run("npm run hermes:standard:verify", repoPath);
    results.push(check(verify.ok, "hermes:standard:verify passes", verify.output.split("\n").slice(-2).join(" | ")));
  }

  results.push(check(fs.existsSync(traceScriptPath), "trace script exists", repo.traceScript));

  if (fs.existsSync(traceScriptPath)) {
    const traceText = fs.readFileSync(traceScriptPath, "utf8");
    for (const field of requiredTraceMetadata) {
      results.push(check(traceText.includes(field), `trace metadata includes ${field}`));
    }
    results.push(check(traceText.includes('trace_type: "review"'), "trace_type is review"));
  }

  const status = run("git status --short --branch", repoPath);
  results.push(check(status.ok && !status.output.split("\n").slice(1).some(Boolean), "working tree clean", status.output));

  const ci = latestCiSummary(repoPath);
  results.push(check(/completed \| success/.test(ci), "recent CI success visible", ci.split("\n")[0] || ci));

  return results;
}

if (!fs.existsSync(sourceStandardPath)) {
  console.error(`FAIL | source standard missing: ${sourceStandardPath}`);
  process.exit(1);
}

console.log("Hermes Langfuse Ecosystem Audit");
console.log("===============================");
console.log(`Source standard: ${sourceStandardPath}`);

let failed = 0;

for (const repo of repos) {
  console.log("");
  console.log(`== ${repo.name} ==`);
  const results = auditRepo(repo);

  for (const result of results) {
    console.log(`${result.status} | ${result.label}${result.details ? ` | ${result.details}` : ""}`);
    if (result.status !== "PASS") failed += 1;
  }
}

console.log("");
if (failed > 0) {
  console.log(`Ecosystem audit: FAIL (${failed} failing checks)`);
  process.exit(1);
}

console.log("Ecosystem audit: PASS");
