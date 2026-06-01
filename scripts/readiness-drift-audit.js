#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const defaultRepoRoot = path.resolve(root, "..");

const downstreamRepos = [
  {
    name: "ai-ops-console",
    path: path.join(defaultRepoRoot, "ai-ops-console"),
    scriptPath: "scripts/hermes-readiness-package-shim.cjs",
    packageStyle: true
  },
  {
    name: "ops-clarity-sprint",
    path: path.join(defaultRepoRoot, "ops-clarity-sprint"),
    scriptPath: "scripts/hermes-readiness.cjs"
  },
  {
    name: "repo-template",
    path: path.join(defaultRepoRoot, "repo-template"),
    scriptPath: "scripts/hermes-readiness.cjs",
    packageStyle: true
  }
];

const sharedFiles = [
  {
    label: "readiness standard",
    source: "standards/readiness.json",
    downstream: "standards/readiness.json"
  },
  {
    label: "valid readiness fixture",
    source: "fixtures/readiness/valid-agent-trace.json",
    downstream: "fixtures/readiness/valid-agent-trace.json"
  },
  {
    label: "readiness runbook",
    source: "docs/runbooks/hermes-readiness.md",
    downstream: "docs/runbooks/hermes-readiness.md"
  }
];

const copiedScript = {
  label: "readiness script",
  source: "scripts/hermes-readiness.js"
};

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function compareFile({ repo, label, sourceRelative, downstreamRelative }) {
  const sourcePath = path.join(root, sourceRelative);
  const downstreamPath = path.join(repo.path, downstreamRelative);

  if (!exists(sourcePath)) {
    return {
      repo: repo.name,
      file: downstreamRelative,
      label,
      status: "source_missing",
      source: sourceRelative,
      downstream: downstreamRelative
    };
  }

  if (!exists(downstreamPath)) {
    return {
      repo: repo.name,
      file: downstreamRelative,
      label,
      status: "downstream_missing",
      source: sourceRelative,
      downstream: downstreamRelative
    };
  }

  const sourceHash = sha256(sourcePath);
  const downstreamHash = sha256(downstreamPath);

  return {
    repo: repo.name,
    file: downstreamRelative,
    label,
    status: sourceHash === downstreamHash ? "match" : "drift",
    source: sourceRelative,
    downstream: downstreamRelative,
    sourceHash,
    downstreamHash
  };
}

function auditRepo(repo) {
  if (!exists(repo.path)) {
    return [
      {
        repo: repo.name,
        file: ".",
        label: "repository",
        status: "repo_missing",
        path: repo.path
      }
    ];
  }

  const results = sharedFiles.map((entry) =>
    compareFile({
      repo,
      label: entry.label,
      sourceRelative: entry.source,
      downstreamRelative: entry.downstream
    })
  );

  if (repo.packageStyle) {
    results.push({
      repo: repo.name,
      file: "package.json",
      label: "readiness command",
      status: "package_style",
      reason:
        "Repo uses the future package-style hermes-readiness command instead of a copied readiness script."
    });
  } else {
    const scriptResult = compareFile({
      repo,
      label: copiedScript.label,
      sourceRelative: copiedScript.source,
      downstreamRelative: repo.scriptPath
    });

    if (scriptResult.status === "drift" && repo.scriptPath.endsWith(".cjs")) {
      scriptResult.status = "expected_drift";
      scriptResult.reason =
        "Downstream repos currently use copied CommonJS .cjs scripts while source has moved to modular .js internals before package extraction.";
    }

    results.push(scriptResult);
  }

  return results;
}

function buildMarkdown(report) {
  const rows = report.results
    .map(
      (result) =>
        `| ${result.repo} | ${result.label} | \`${result.file}\` | ${result.status} |`
    )
    .join("\n");

  const driftItems = report.results
    .filter((result) => result.status !== "match")
    .map((result) => {
      const reason = result.reason ? ` — ${result.reason}` : "";
      return `- ${result.repo}: ${result.label} (${result.status}) — \`${result.file}\`${reason}`;
    });

  return `# Hermes Readiness Downstream Drift Audit

Generated at: ${report.generatedAt}

Status: **${report.status.toUpperCase()}**

## Summary

- Matches: ${report.summary.match}
- Drift: ${report.summary.drift}
- Missing downstream files: ${report.summary.downstream_missing}
- Missing source files: ${report.summary.source_missing}
- Missing repos: ${report.summary.repo_missing}
- Expected drift: ${report.summary.expected_drift}
- Package-style repos: ${report.summary.package_style}

## Results

| Repo | Asset | File | Status |
| --- | --- | --- | --- |
${rows}

## Non-Matching Items

${driftItems.length ? driftItems.join("\n") : "- None."}

## Notes

Script extension differences are expected downstream. If copied script hashes differ only because source uses \`.js\` and downstream uses \`.cjs\`, document that difference before extraction.

Long-term, this audit should be replaced by package version checks after \`@hermes/readiness\` or equivalent is extracted.
`;
}

function main() {
  const results = downstreamRepos.flatMap(auditRepo);

  const summary = results.reduce(
    (acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    },
    {
      match: 0,
      drift: 0,
      downstream_missing: 0,
      source_missing: 0,
      repo_missing: 0,
      expected_drift: 0,
      package_style: 0
    }
  );

  const status =
    summary.drift ||
    summary.downstream_missing ||
    summary.source_missing ||
    summary.repo_missing
      ? "warn"
      : "pass";

  const report = {
    schemaVersion: "0.1.0",
    generatedAt: new Date().toISOString(),
    status,
    sourceRepo: "hermes-observability",
    downstreamRepos: downstreamRepos.map((repo) => ({
      name: repo.name,
      path: repo.path
    })),
    summary,
    results
  };

  const outDir = path.join(root, "reports", "readiness");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, "latest-drift-audit.json");
  const mdPath = path.join(outDir, "latest-drift-audit.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, buildMarkdown(report));

  console.log(`Hermes readiness drift audit status: ${status.toUpperCase()}`);
  console.log(`JSON report: ${path.relative(root, jsonPath)}`);
  console.log(`Markdown report: ${path.relative(root, mdPath)}`);

  if (status !== "pass") {
    console.log("Non-matching items found. Review the drift audit report.");
  }
}

main();
