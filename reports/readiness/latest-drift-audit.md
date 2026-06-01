# Hermes Readiness Downstream Drift Audit

Generated at: 2026-06-01T02:40:03.119Z

Status: **WARN**

## Summary

- Matches: 9
- Drift: 3
- Missing downstream files: 0
- Missing source files: 0
- Missing repos: 0

## Results

| Repo | Asset | File | Status |
| --- | --- | --- | --- |
| ai-ops-console | readiness standard | `standards/readiness.json` | match |
| ai-ops-console | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| ai-ops-console | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| ai-ops-console | readiness script | `scripts/hermes-readiness.cjs` | drift |
| ops-clarity-sprint | readiness standard | `standards/readiness.json` | match |
| ops-clarity-sprint | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| ops-clarity-sprint | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| ops-clarity-sprint | readiness script | `scripts/hermes-readiness.cjs` | drift |
| repo-template | readiness standard | `standards/readiness.json` | match |
| repo-template | valid readiness fixture | `fixtures/readiness/valid-agent-trace.json` | match |
| repo-template | readiness runbook | `docs/runbooks/hermes-readiness.md` | match |
| repo-template | readiness script | `scripts/hermes-readiness.cjs` | drift |

## Non-Matching Items

- ai-ops-console: readiness script (drift) — `scripts/hermes-readiness.cjs`
- ops-clarity-sprint: readiness script (drift) — `scripts/hermes-readiness.cjs`
- repo-template: readiness script (drift) — `scripts/hermes-readiness.cjs`

## Notes

Script extension differences are expected downstream. If copied script hashes differ only because source uses `.js` and downstream uses `.cjs`, document that difference before extraction.

Long-term, this audit should be replaced by package version checks after `@hermes/readiness` or equivalent is extracted.
