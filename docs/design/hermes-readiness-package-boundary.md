# Hermes Readiness Package Boundary

## Purpose

Define the future extraction boundary for `@hermes/readiness` before implementing package extraction.

This document follows Decision 0001: keep readiness assets copied temporarily after three successful pilots, then prepare the package boundary before replacing copied assets.

## Current State

The Hermes readiness check currently exists in:

- `hermes-observability`
- `ai-ops-console`
- `ops-clarity-sprint`
- `repo-template`

Completed pilots:

| Repo | Role | Result | Notes |
| --- | --- | --- | --- |
| `hermes-observability` | source of truth | passed | Owns the original readiness standard, fixture, script, reports, and runbook. |
| `ai-ops-console` | app/product repo | passed | Required `.cjs` script naming and lint ignore. |
| `ops-clarity-sprint` | Hermes/operator repo | passed | Integrated cleanly with existing `check` script. |
| `repo-template` | baseline template repo | passed | Proved readiness can be part of the repo baseline. |

## Candidate Package

Package name:

```text
@hermes/readiness
```

Alternative package locations:

```txt
@hermes/observability/readiness
repo-template v2 generated baseline
```

## Recommended Boundary

`@hermes/readiness` should own reusable readiness logic only.

It should include:

- readiness schema
- fixture validation
- report builder
- Markdown report renderer
- JSON report writer
- default readiness standard
- CLI entrypoint
- validation result types
- package version metadata

It should not own:

- repo-specific lint config
- repo-specific CI workflow
- repo-specific package scripts
- downstream report commit policy
- downstream custom standards beyond supported extension points
- Langfuse credential handling
- live trace submission

## Proposed Package Shape

```txt
packages/readiness/
  package.json
  src/
    cli.ts
    index.ts
    load-standard.ts
    validate-trace.ts
    privacy-checks.ts
    artifact-checks.ts
    report-json.ts
    report-markdown.ts
  standards/
    readiness.json
  fixtures/
    valid-agent-trace.json
  README.md
```

If this repo stays single-package for now, the equivalent boundary can exist under:

```txt
src/readiness/
standards/readiness.json
fixtures/readiness/
scripts/hermes-readiness.js
```

## CLI Contract

Primary command:

```bash
hermes-readiness
```

Expected `npm script` in downstream repos:

```json
{
  "scripts": {
    "hermes:readiness": "hermes-readiness"
  }
}
```

Supported options:

```bash
hermes-readiness \
  --standard standards/readiness.json \
  --fixture fixtures/readiness/valid-agent-trace.json \
  --out-json reports/readiness/latest-readiness.json \
  --out-md reports/readiness/latest-readiness.md
```

Defaults:

```txt
standard: standards/readiness.json
fixture: fixtures/readiness/valid-agent-trace.json
out-json: reports/readiness/latest-readiness.json
out-md: reports/readiness/latest-readiness.md
```

## Downstream Integration Contract

Downstream repos should own:

- `package.json` script wiring
- whether `hermes: readiness` is part of `check`
- lint ignore rules if needed
- CI workflow invocation
- report commit policy
- local fixture customization

Downstream repos should not need to copy:

- validator source code
- Markdown renderer
- JSON report writer
- default checks
- default readiness schema

## Extension Points

The package should support:

- custom readiness standard path
- custom fixture path
- custom output paths
- optional warning-only recommended fields
- optional strict mode
- custom package/tool version string
- future multiple-fixture validation

Future strict mode:

```bash
hermes-readiness --strict
```

Strict mode should fail on warnings as well as failures.

## Report Contract

JSON report should include:

```json
{
  "schema_version": "0.1.0",
  "tool_version": "@hermes/readiness@x.y.z",
  "generated_at": "ISO timestamp",
  "status": "pass | fail",
  "standard_version": "0.1.0",
  "fixture": "path",
  "summary": {
    "fail": 0,
    "warn": 0
  },
  "checks": {},
  "findings": []
}
```

Markdown report should include:

- title
- status
- generated timestamp
- summary
- checks performed
- findings
- next actions

## Versioning

Version separately from downstream repos.

Use package semver:

- patch: wording, reporting, non-breaking validation improvements
- minor: new optional checks or fields
- major: required field changes, output schema changes, CLI breaking changes

Readiness standard should include its own version.

Package version and standard version should both appear in reports.

## Source-of-Truth Flow

Until extraction:

```txt
hermes-observability
  -> copy assets manually to pilots
  -> observe integration differences
  -> update decision/design docs
```

After execution:

```txt
@hermes/readiness
  -> downstream repos install package
  -> downstream repos keep only config/fixtures if customized
  -> repo-template carries default script wiring
```

## Migration Plan

### Phase 1: Stabilize interface

- keep copied assets
- document differences across pilots
- confirm CLI arguments
- confirm report paths
- confirm package/module format

### Phase 2: Extract package

- create package source boundary
- move validator logic into reusable module
- expose CLI
- keep compatibility with existing copied reports
- add package-level tests

### Phase 3: Replace copied assets

Migrate:

  1. `repo-template`
  2. `ai-ops-console`
  3. `ops-clarity-sprint`

Each migration should:

- remove copied validator script
- keep or customize standard/fixture
- use package CLI
- preserve `npm run hermes:readiness`
- preserve report output paths

### Phase 4: Promote baseline

After package migration passes:

- update repo-template v2
- document setup in runbook
- add CI example
- add downstream adoption checklist

## Open Questions

- Should `@hermes/readiness` live as a standalone package or under `@hermes/observability`?
- Should downstream repos commit generated readiness reports?
- Should default fixture live in the package, downstream repo, or both?
- Should the package support multiple fixtures immediately?
- Should recommended fields warn or fail in CI strict mode?
- Should repo-template include readiness by default for every new repo?

## Current Recommendation

Do not extract immediately.

Use this package-boundary document to guide the next implementation step.

Recommended next implementation:

  1. create package-level module boundaries inside `hermes-observability`
  2. add tests around the readiness validator
  3. add CLI options without changing downstream behavior
  4. then migrate downstream repos from copied script to package usage
