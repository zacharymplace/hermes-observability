# Decision 0001: Keep Hermes readiness assets copied temporarily before extracting @hermes/readiness

## Status

Accepted

## Date

2026-05-31

## Context

The Hermes Agent/MCP Observability Readiness Kit was introduced in `hermes-observability` and successfully piloted in two downstream repositories:

- `ai-ops-console`
- `ops-clarity-sprint`

Both pilots added:

- `hermes:readiness`
- readiness fixture
- readiness standard
- JSON readiness report
- Markdown readiness report
- runbook documentation
- `npm run check` integration

Both downstream pilots passed their local and CI checks.

## Decision

Keep readiness assets copied directly into pilot repositories temporarily.

Do not extract `@hermes/readiness` yet.

Revisit extraction after either:

1. one more successful downstream repo pilot, or
2. the readiness interface stabilizes enough to define a clean package boundary.

## Rationale

Two successful pilots prove the readiness check is useful and portable, but they do not yet prove the package interface is stable.

The current implementation still has repo-specific concerns:

- script extension and lint behavior can differ by repo
- report paths may need conventions
- package/module format is not fully decided
- downstream CI expectations may vary
- readiness schema may expand after additional pilots

Keeping the assets copied for one more cycle avoids premature package extraction.

## Alternatives Considered

### Extract `@hermes/readiness` immediately

Rejected for now.

This would reduce copying, but risks freezing an immature interface too early.

### Keep copied assets indefinitely

Rejected.

Long-term copying will create drift across Hermes-adjacent repos.

### Fold readiness into `repo-template v2`

Deferred.

The readiness check may eventually belong in the repo template baseline, but the interface should stabilize first.

## Consequences

### Positive

- avoids premature abstraction
- allows one more pilot to reveal interface issues
- keeps downstream repos independently functional
- preserves a clear extraction path

### Negative

- short-term duplication remains
- updates must be manually copied across pilot repos
- drift risk increases if extraction is delayed too long

## Extraction Criteria

Create `@hermes/readiness` or equivalent shared package when at least three of the following are true:

- three downstream repos successfully run `hermes:readiness`
- report paths and schema are stable
- module format is decided
- lint/CI integration pattern is documented
- at least one downstream repo needs a non-trivial customization
- readiness standards need versioned distribution

## Next Actions

- Identify the third pilot repository
- Track differences between pilots
- Define the stable readiness package boundary
- Decide whether extraction should happen as:
  - `@hermes/readiness`
  - part of `@hermes/observability`
  - `repo-template v2` baseline
- Keep `hermes-observability` as the source of truth until extraction
