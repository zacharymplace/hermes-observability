# Hermes Readiness Package Version Audit

Generated at: 2026-08-24T15:30:59.155Z

Status: **PASS**

## Summary

- Source package version: `0.1.0`
- Matches: 3
- Shim pending package: 0
- Version mismatches: 0
- Missing package dependencies: 0
- Missing package files/repos: 0

## Results

| Repo | Status | Actual Version | Expected Version | Dependency Group | Package-Style Command |
| --- | --- | --- | --- | --- | --- |
| ai-ops-console | match | file:vendor/hermes/hermes-readiness-0.1.0.tgz | 0.1.0 | devDependencies | yes |
| sentra | match | file:vendor/hermes/hermes-readiness-0.1.0.tgz | 0.1.0 | devDependencies | yes |
| repo-template | match | file:../hermes-observability/hermes-readiness-0.1.0.tgz | 0.1.0 | devDependencies | yes |

## Non-Matching Items

- No non-matching items.

## Notes

This audit verifies installed @hermes/readiness versions. The shim_pending_package state remains supported for legacy consumers that expose package-style commands without declaring the package. Current package consumers should report match when their installed version matches the source package version.

Once `@hermes/readiness` is distributed, this audit should replace copied-file drift checks as the primary downstream readiness consistency check.
