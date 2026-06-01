# Hermes Readiness Downstream Drift Audit

Generated at: 2026-06-01T03:42:49.517Z

Status: **PASS**

## Summary

- Matches: 9
- Drift: 0
- Missing downstream files: 0
- Missing source files: 0
- Missing repos: 0
- Expected drift: 0
- Package-style repos: 3

## Results

| Repo | Asset | File | Status |
| --- | --- | --- | --- |
| ai-ops-console | readiness standard | `standards/readiness.json` | match |
| ai-ops-console | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| ai-ops-console | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| ai-ops-console | readiness command | `package.json` | package_style |
| ops-clarity-sprint | readiness standard | `standards/readiness.json` | match |
| ops-clarity-sprint | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| ops-clarity-sprint | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| ops-clarity-sprint | readiness command | `package.json` | package_style |
| repo-template | readiness standard | `standards/readiness.json` | match |
| repo-template | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| repo-template | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| repo-template | readiness command | `package.json` | package_style |

## Non-Matching Items

- ai-ops-console: readiness command (package_style) — `package.json` — Repo uses the future package-style hermes-readiness command instead of a copied readiness script.
- ops-clarity-sprint: readiness command (package_style) — `package.json` — Repo uses the future package-style hermes-readiness command instead of a copied readiness script.
- repo-template: readiness command (package_style) — `package.json` — Repo uses the future package-style hermes-readiness command instead of a copied readiness script.

## Notes

Script extension differences are expected downstream. If copied script hashes differ only because source uses `.js` and downstream uses `.cjs`, document that difference before extraction.

Long-term, this audit should be replaced by package version checks after `@hermes/readiness` or equivalent is extracted.
