# Hermes Readiness Source-of-Truth Update Flow

## Purpose

Define how Hermes readiness changes move from `hermes-observability` into downstream repositories. The readiness CLI is distributed through `@hermes/readiness`; the standard, fixture, and runbook remain synchronized contract assets.

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

Readiness is currently consumed by:

- `ai-ops-console`
- `sentra`
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

When readiness changes are merged:

1. Sync hermes-observability/main.
2. Run npm run check.
3. Pack and distribute the updated @hermes/readiness version.
4. Copy changed contract assets to each consumer.
5. Run each consumer's npm run hermes:readiness.
6. Run each consumer's npm run check.
7. Run the drift and package-version audits.

## Shared Contract Assets

Keep these synchronized in all three consumers:

- standards/readiness.json
- fixtures/readiness/valid-agent-trace.json
- docs/runbooks/hermes-readiness.md

Do not overwrite repository-specific lint, CI, or privacy configuration without review.

## Package Sources

| Repo | Package source | Integration |
| --- | --- | --- |
| ai-ops-console | Vendored hermes-readiness-0.1.0.tgz | Direct hermes-readiness command. |
| sentra | Vendored hermes-readiness-0.1.0.tgz | Direct hermes-readiness command. |
| repo-template | Sibling hermes-observability package archive | Direct hermes-readiness baseline command. |

## Allowed Downstream Differences

- package source location
- lint ignore rules
- CI workflow names
- report commit policy
- repository-specific fixtures
- repository-specific documentation links

## Package Update Seal

A readiness package update is complete when:

- all three consumers use the intended package version;
- shared contract assets match;
- each consumer's readiness and repository checks pass;
- npm run readiness:drift passes;
- npm run readiness:package-version:audit passes.
