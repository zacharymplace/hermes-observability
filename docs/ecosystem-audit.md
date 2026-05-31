# Hermes Langfuse Ecosystem Audit

The ecosystem audit verifies that downstream Hermes-enabled repos are aligned with the exported Hermes observability standard.

## Command

```bash
npm run ecosystem:gate
```

## What it checks

- downstream repo path exists
- committed `docs/hermes-observability-standard.json` exists
- downstream standard matches `dist/hermes-observability-stanard.json`
- `hermes:standard:verify` exists and passes
- `hermes:observe` exists
- `review trace script` exists
- `review trace` includes required metadata:
  - repo
  - branch
  - commit
  - environment
  - standard_version
  - trace_type
- `trace_type` is review
- working tree is clean
- recent CI success is visible

## When to run

Run this after:

- changing the Hermes observability standard
- refreshing downstream standards
- changing downstream Langfuse review trace scripts
- before declaring the Langfuse ecosystem healthy

## Why it is separate from `npm run check`

`npm run check` stays repo-local and CI-safe.

`npm run ecosystem:gate` depends on local sibling repo paths under `~/dev`, so it is intentionally a non-default local operator gate.
