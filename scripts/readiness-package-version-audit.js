#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const sourcePackagePath = path.join(root, "packages", "readiness", "package.json");
const outJson = path.join(root, "reports", "readiness", "latest-package-version-audit.json");
const outMd = path.join(root, "reports", "readiness", "latest-package-version-audit.md");

const downstreamRepos = [
  {
    name: "ai-ops-console",
    path: path.resolve(root, "..", "ai-ops-console")
  },
  {
    name: "ops-clarity-sprint",
    path: path.resolve(root, "..", "ops-clarity-sprint")
  },
  {
    name: "repo-template",
    path: path.resolve(root, "..", "repo-template")
  }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasPackageStyleCommand(packageJson) {
  const command = packageJson.scripts && packageJson.scripts["hermes:readiness"];
  return command === "hermes-readiness" ||
    command === "node scripts/hermes-readiness-package-shim.cjs";
}

function findDependency(packageJson) {
  for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
    const deps = packageJson[group] || {};
    if (deps["@hermes/readiness"]) {
      return {
        group,
        version: deps["@hermes/readiness"]
      };
    }
  }

  return null;
}

function dependencyMatches(actual, expected) {
  if (actual === expected) return true;
  if (actual === `^${expected}`) return true;
  if (actual === `~${expected}`) return true;
  if (actual.includes(`hermes-readiness-${expected}.tgz`)) return true;
  if (actual.includes(`@hermes/readiness-${expected}.tgz`)) return true;
  return false;
}

function auditRepo(repo, expectedVersion) {
  const packageJsonPath = path.join(repo.path, "package.json");

  if (!fs.existsSync(repo.path) || !fs.existsSync(packageJsonPath)) {
    return {
      repo: repo.name,
      status: "missing_repo",
      actualVersion: null,
      expectedVersion,
      dependencyGroup: null,
      packageStyleCommand: false,
      reason: "Repo or package.json is missing."
    };
  }

  const packageJson = readJson(packageJsonPath);
  const packageStyleCommand = hasPackageStyleCommand(packageJson);
  const dependency = findDependency(packageJson);

  if (!dependency) {
    return {
      repo: repo.name,
      status: packageStyleCommand ? "shim_pending_package" : "missing_package_dependency",
      actualVersion: null,
      expectedVersion,
      dependencyGroup: null,
      packageStyleCommand,
      reason: packageStyleCommand
        ? "Repo uses package-style command or shim, but @hermes/readiness is not installed yet."
        : "Repo does not declare @hermes/readiness."
    };
  }

  const matches = dependencyMatches(dependency.version, expectedVersion);

  return {
    repo: repo.name,
    status: matches ? "match" : "version_mismatch",
    actualVersion: dependency.version,
    expectedVersion,
    dependencyGroup: dependency.group,
    packageStyleCommand,
    reason: matches
      ? "Installed @hermes/readiness version matches source package version."
      : "Installed @hermes/readiness version does not match source package version."
  };
}

function count(results, status) {
  return results.filter((result) => result.status === status).length;
}

function renderMarkdown(report) {
  const rows = report.results
    .map((result) => {
      return `| ${result.repo} | ${result.status} | ${result.actualVersion || "n/a"} | ${result.expectedVersion} | ${result.dependencyGroup || "n/a"} | ${result.packageStyleCommand ? "yes" : "no"} |`;
    })
    .join("\n");

  const nonMatching = report.results
    .filter((result) => result.status !== "match")
    .map((result) => `- ${result.repo}: ${result.status} — ${result.reason}`)
    .join("\n") || "- No non-matching items.";

  return `# Hermes Readiness Package Version Audit

Generated at: ${report.generatedAt}

Status: **${report.status.toUpperCase()}**

## Summary

- Source package version: \`${report.sourcePackageVersion}\`
- Matches: ${report.summary.matches}
- Shim pending package: ${report.summary.shimPendingPackage}
- Version mismatches: ${report.summary.versionMismatches}
- Missing package dependencies: ${report.summary.missingPackageDependencies}
- Missing package files/repos: ${report.summary.missingPackageFilesOrRepos}

## Results

| Repo | Status | Actual Version | Expected Version | Dependency Group | Package-Style Command |
| --- | --- | --- | --- | --- | --- |
${rows}

## Non-Matching Items

${nonMatching}

## Notes

This audit is scaffolding for the post-copy state. During the bridge period, downstream repos may show \`shim_pending_package\` while they use package-style shims before \`@hermes/readiness\` is installable. Repos installed from a local tarball should report \`match\` when the tarball version matches the source package version.

Once \`@hermes/readiness\` is distributed, this audit should replace copied-file drift checks as the primary downstream readiness consistency check.
`;
}

const sourcePackage = readJson(sourcePackagePath);
const expectedVersion = sourcePackage.version;
const results = downstreamRepos.map((repo) => auditRepo(repo, expectedVersion));

const summary = {
  matches: count(results, "match"),
  shimPendingPackage: count(results, "shim_pending_package"),
  versionMismatches: count(results, "version_mismatch"),
  missingPackageDependencies: count(results, "missing_package_dependency"),
  missingPackageFilesOrRepos: count(results, "missing_repo")
};

const status = summary.versionMismatches === 0 &&
  summary.missingPackageDependencies === 0 &&
  summary.missingPackageFilesOrRepos === 0
    ? "pass"
    : "warn";

const report = {
  generatedAt: new Date().toISOString(),
  status,
  sourcePackageVersion: expectedVersion,
  summary,
  results
};

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(outMd, renderMarkdown(report));

console.log(`Hermes readiness package version audit status: ${status.toUpperCase()}`);
console.log(`JSON report: ${path.relative(root, outJson)}`);
console.log(`Markdown report: ${path.relative(root, outMd)}`);

if (status !== "pass") {
  process.exitCode = 1;
}
