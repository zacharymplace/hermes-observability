#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const defaultRepoRoot = path.resolve(repoRoot, "..");

const sourcePackagePath = path.join(repoRoot, "packages", "readiness", "package.json");

const downstreamRepos = [
  {
    name: "ai-ops-console",
    path: path.join(defaultRepoRoot, "ai-ops-console")
  },
  {
    name: "ops-clarity-sprint",
    path: path.join(defaultRepoRoot, "ops-clarity-sprint")
  },
  {
    name: "repo-template",
    path: path.join(defaultRepoRoot, "repo-template")
  }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function findReadinessVersion(packageJson) {
  const groups = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ];

  for (const group of groups) {
    if (packageJson[group] && packageJson[group]["@hermes/readiness"]) {
      return {
        group,
        version: packageJson[group]["@hermes/readiness"]
      };
    }
  }

  return null;
}

function hasPackageStyleCommand(packageJson) {
  return packageJson.scripts && packageJson.scripts["hermes:readiness"]
    ? packageJson.scripts["hermes:readiness"].includes("hermes-readiness") ||
        packageJson.scripts["hermes:readiness"].includes("hermes-readiness-package-shim")
    : false;
}

function auditRepo(repo, sourceVersion) {
  const packagePath = path.join(repo.path, "package.json");

  if (!exists(repo.path)) {
    return {
      repo: repo.name,
      status: "missing_repo",
      packageJson: path.relative(repoRoot, packagePath),
      expectedVersion: sourceVersion,
      actualVersion: null,
      dependencyGroup: null,
      packageStyleCommand: false,
      message: "Downstream repo is missing."
    };
  }

  if (!exists(packagePath)) {
    return {
      repo: repo.name,
      status: "missing_package_json",
      packageJson: path.relative(repoRoot, packagePath),
      expectedVersion: sourceVersion,
      actualVersion: null,
      dependencyGroup: null,
      packageStyleCommand: false,
      message: "Downstream package.json is missing."
    };
  }

  const packageJson = readJson(packagePath);
  const versionInfo = findReadinessVersion(packageJson);
  const packageStyleCommand = hasPackageStyleCommand(packageJson);

  if (!versionInfo) {
    return {
      repo: repo.name,
      status: packageStyleCommand ? "shim_pending_package" : "missing_package_dependency",
      packageJson: path.relative(repoRoot, packagePath),
      expectedVersion: sourceVersion,
      actualVersion: null,
      dependencyGroup: null,
      packageStyleCommand,
      message: packageStyleCommand
        ? "Repo uses package-style command or shim, but @hermes/readiness is not installed yet."
        : "Repo does not declare @hermes/readiness."
    };
  }

  if (versionInfo.version !== sourceVersion) {
    return {
      repo: repo.name,
      status: "version_mismatch",
      packageJson: path.relative(repoRoot, packagePath),
      expectedVersion: sourceVersion,
      actualVersion: versionInfo.version,
      dependencyGroup: versionInfo.group,
      packageStyleCommand,
      message: "Installed @hermes/readiness version does not match source package version."
    };
  }

  return {
    repo: repo.name,
    status: "match",
    packageJson: path.relative(repoRoot, packagePath),
    expectedVersion: sourceVersion,
    actualVersion: versionInfo.version,
    dependencyGroup: versionInfo.group,
    packageStyleCommand,
    message: "Installed @hermes/readiness version matches source package version."
  };
}

function renderMarkdown(report) {
  const rows = report.results
    .map(
      (item) =>
        `| ${item.repo} | ${item.status} | ${item.actualVersion || "n/a"} | ${item.expectedVersion} | ${item.dependencyGroup || "n/a"} | ${item.packageStyleCommand ? "yes" : "no"} |`
    )
    .join("\n");

  const nonMatches = report.results
    .filter((item) => item.status !== "match")
    .map((item) => `- ${item.repo}: ${item.status} — ${item.message}`)
    .join("\n") || "- None.";

  return `# Hermes Readiness Package Version Audit

Generated at: ${report.generatedAt}

Status: **${report.status.toUpperCase()}**

## Summary

- Source package version: \`${report.sourceVersion}\`
- Matches: ${report.summary.match}
- Shim pending package: ${report.summary.shim_pending_package}
- Version mismatches: ${report.summary.version_mismatch}
- Missing package dependencies: ${report.summary.missing_package_dependency}
- Missing package files/repos: ${report.summary.missing}

## Results

| Repo | Status | Actual Version | Expected Version | Dependency Group | Package-Style Command |
| --- | --- | --- | --- | --- | --- |
${rows}

## Non-Matching Items

${nonMatches}

## Notes

This audit is scaffolding for the post-copy state. During the bridge period, downstream repos may show \`shim_pending_package\` while they use package-style shims before \`@hermes/readiness\` is installable.

Once \`@hermes/readiness\` is distributed, this audit should replace copied-file drift checks as the primary downstream readiness consistency check.
`;
}

if (!exists(sourcePackagePath)) {
  console.error(`Missing source package: ${sourcePackagePath}`);
  process.exit(1);
}

const sourcePackage = readJson(sourcePackagePath);
const sourceVersion = sourcePackage.version;

const results = downstreamRepos.map((repo) => auditRepo(repo, sourceVersion));

const summary = {
  match: results.filter((item) => item.status === "match").length,
  shim_pending_package: results.filter((item) => item.status === "shim_pending_package").length,
  version_mismatch: results.filter((item) => item.status === "version_mismatch").length,
  missing_package_dependency: results.filter((item) => item.status === "missing_package_dependency").length,
  missing: results.filter((item) => item.status === "missing_repo" || item.status === "missing_package_json").length
};

const hardFailures =
  summary.version_mismatch +
  summary.missing_package_dependency +
  summary.missing;

const report = {
  schemaVersion: "0.1.0",
  generatedAt: new Date().toISOString(),
  status: hardFailures === 0 ? "pass" : "warn",
  sourcePackage: "packages/readiness/package.json",
  sourceVersion,
  summary,
  results
};

const outDir = path.join(repoRoot, "reports", "readiness");
const outJson = path.join(outDir, "latest-package-version-audit.json");
const outMd = path.join(outDir, "latest-package-version-audit.md");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(outMd, renderMarkdown(report));

console.log(`Hermes readiness package version audit status: ${report.status.toUpperCase()}`);
console.log(`JSON report: ${path.relative(repoRoot, outJson)}`);
console.log(`Markdown report: ${path.relative(repoRoot, outMd)}`);

if (report.status !== "pass") {
  process.exitCode = 1;
}
