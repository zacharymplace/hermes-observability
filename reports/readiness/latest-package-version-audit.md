# Hermes Readiness Package Version Audit

Generated at: 2026-06-01T03:57:33.572Z

Status: **PASS**

## Summary

- Source package version: `0.1.0`
- Matches: 0
- Shim pending package: 3
- Version mismatches: 0
- Missing package dependencies: 0
- Missing package files/repos: 0

## Results

| Repo | Status | Actual Version | Expected Version | Dependency Group | Package-Style Command |
| --- | --- | --- | --- | --- | --- |
| ai-ops-console | shim_pending_package | n/a | 0.1.0 | n/a | yes |
| ops-clarity-sprint | shim_pending_package | n/a | 0.1.0 | n/a | yes |
| repo-template | shim_pending_package | n/a | 0.1.0 | n/a | yes |

## Non-Matching Items

- ai-ops-console: shim_pending_package — Repo uses package-style command or shim, but @hermes/readiness is not installed yet.
- ops-clarity-sprint: shim_pending_package — Repo uses package-style command or shim, but @hermes/readiness is not installed yet.
- repo-template: shim_pending_package — Repo uses package-style command or shim, but @hermes/readiness is not installed yet.

## Notes

This audit is scaffolding for the post-copy state. During the bridge period, downstream repos may show `shim_pending_package` while they use package-style shims before `@hermes/readiness` is installable.

Once `@hermes/readiness` is distributed, this audit should replace copied-file drift checks as the primary downstream readiness consistency check.
