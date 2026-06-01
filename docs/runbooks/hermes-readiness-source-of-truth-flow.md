# Hermes Readiness Source-of-Truth Update Flow

## Purpose

Define how Hermes readiness changes move from `hermes-observability` into downstream repositories while readiness assets remain copied rather than packaged.

This runbook applies until the readiness logic is extracted into `@hermes/readiness`, an `@hermes/observability` submodule, or the `repo-template v2` baseline.

## Source of Truth

`hermes-observability` is the source of truth for:

- `standards/readiness.json`
- `fixtures/readiness/valid-agent-trace.json`
- `scripts/hermes-readiness.js`
- `docs/runbooks/hermes-readiness.md`
- `lib/readiness/*`
- readiness validator tests
- readiness module tests
- readiness report contract

## Current Downstream Repositories

Readiness is currently copied into:

- `ai-ops-console`
- `ops-clarity-sprint`
- `repo-template`

## Update Rule

Any readiness behavior change must start in `hermes-observability`.

Do not edit downstream readiness scripts first unless the change is a repo-specific integration fix.

## Change Types

### Source-of-truth changes

Make these in `hermes-observability` first:

- readiness schema changes
- required field changes
- recommended field changes
- privacy default changes
- artifact metadata changes
- validator behavior changes
- Markdown/JSON report contract changes
- CLI option changes
- fixture changes
- package-boundary changes

### Downstream integration changes

Make these in the downstream repo only:

- package script wiring
- lint ignore rules
- CI workflow integration
- report commit policy
- repo-specific fixture customization
- repo-specific documentation links

## Propagation Sequence

When a source-of-truth readiness change is merged:

1. Sync `hermes-observability/main`.
2. Run `npm run check`.
3. Copy changed readiness assets to each downstream repo.
4. Run each downstream repo's `npm run hermes:readiness`.
5. Run each downstream repo's `npm run check`.
6. Open one PR per downstream repo.
7. Record downstream differences in this repo before considering extraction.

## Copy Map

### `ai-ops-console`

Copy:

```text
standards/readiness.json
fixtures/readiness/valid-agent-trace.json
docs/runbooks/hermes-readiness.md
```

If still using copied script logic, copy/adapt:

```txt
scripts/hermes-readiness.cjs
```

Do not overwrite repo-specific lint config without review.

### `ops-clarity-sprint`

Copy:

```txt
standards/readiness.json
fixtures/readiness/valid-agent-trace.json
docs/runbooks/hermes-readiness.md
scripts/hermes-readiness.cjs
```

Preserve existing `check script` behavior.

### `repo-template`

Copy:

```txt
standards/readiness.json
fixtures/readiness/valid-agent-trace.json
docs/runbooks/hermes-readiness.md
scripts/hermes-readiness.cjs
```

Preserve default baseline behavior.

## Verification Commands

### Source

```bash
cd ~/dev/hermes-observability
npm run hermes:readiness
npm run test:readiness
npm run test:readiness:module
npm run check
```

### Downstream

```bash
npm run hermes:readiness
npm run check
```

## Drift Detection

A downstream repo may be drifting if:

- readiness script differs from source without a documented reason
- readiness schema differs from source
- fixture differs from source
- report paths differs unexpectedly
- `npm run check` no longer includes readiness
- generated reports are stale or missing
- lint/CI ignores are hiding unrelated files

## Allowed Differences

Allowed downstream differences:

- `.js` vs `.cjs` script extension
- lint ignore rules
- package script composition
- CI workflow names
- report commit policy
- repo-specific fixture additions
- repo-specific README/runbook links

## Difference Log

Track meaningful differences here until packaging removes copies scripts.

| Repo | Difference | Reason | Keep / Remove Later |
| --- | --- | --- | --- |
| `ai-ops-console` | Uses `scripts/hermes-readiness.cjs` and lint ignore. | Next/ESLint rules reject CommonJS `require()` in linted scripts. | Remove later when using package CLI. |
| `ops-clarity-sprint` | Uses `scripts/hermes-readiness.cjs`. | CommonJS compatibility for copied script. | Remove later when using package CLI. |
| `repo-template` | Adds baseline `package.json`. | Template needed `npm` script surface. | Keep as repo baseline. |

## Extraction Trigger

Replace copied assets with package usage when:

- module format is decided
- package CLI is stable
- report contract is stable
- downstream lint/CI integration is documented
- package versioning is documented
- migration from copied script to package usage is tested in `repo-template`

## Future Package Flow

After extraction, the flow should become:

```txt
@hermes/readiness release
  -> update repo-template baseline
  -> migrate downstream repos to package version
  -> remove copied validator scripts
  -> keep only repo-specific config/fixtures when needed
```

## Current Recommendation

Keep copying assets only for short-term stabilization.

Do not allow more than one additional source-of-truth behavior change before creating either:

- a package extraction PR, or
- a generator/update script for downstream repositories.
