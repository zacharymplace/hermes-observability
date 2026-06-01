# Decision 0001: Keep Hermes readiness assets copied temporarily before extracting @hermes/readiness

## Status

Accepted

## Date

2026-05-31

## Context

The Hermes Agent/MCP Observability Readiness Kit was introduced in `hermes-observability` and successfully piloted in three downstream/baseline repositories:

- `ai-ops-console`
- `ops-clarity-sprint`
- `repo-template`

The first two pilots proved portability into active application/ops repositories. The third pilot proved the check can also live in the baseline repo template.

All pilots added:

- `hermes:readiness`
- readiness fixture
- readiness standard
- JSON readiness report
- Markdown readiness report
- runbook documentation
- `npm run check` integration

All pilots passed local checks. `ai-ops-console` and `ops-clarity-sprint` also passed their PR/CI checks. `repo-template` had no workflow run configured, but passed `npm run check` locally after merge.

## Decision

Keep readiness assets copied directly into pilot repositories temporarily, but promote extraction planning from "wait for one more pilot" to "prepare package boundary."

Do not extract `@hermes/readiness` immediately in the same step as the third pilot.

Begin designing the extraction boundary now that three pilots have passed. Revisit implementation after the interface contract is documented.

## Rationale

Three successful pilots prove the readiness check is useful, portable, and suitable for repo-template baseline consideration, but they still do not fully prove the package interface is stable.

The current implementation still has repo-specific concerns:

- script extension and lint behavior can differ by repo
- report paths may need conventions
- package/module format is not fully decided
- downstream CI expectations may vary
- readiness schema may expand after additional pilots

Keeping the assets copied for one more short cycle avoids premature package extraction while giving the project enough evidence to define a cleaner shared interface.

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

Create `@hermes/readiness` or equivalent shared package when the following package-boundary items are resolved:

- three downstream/baseline repos successfully run `hermes:readiness` — met
- report paths and schema are stable — mostly met
- module format is decided — pending
- lint/CI integration pattern is documented — partially met
- readiness source-of-truth update process is documented — pending
- readiness standards need versioned distribution — likely
- at least one downstream repo needs a non-trivial customization — not yet observed

## Next Actions

- Treat `repo-template` as the completed third pilot
- Track differences between pilots
- Define the stable readiness package boundary
- Document the source-of-truth update flow from `hermes-observability` to downstream repos
- Decide whether copied assets should be replaced with package usage or template generation
- Decide whether extraction should happen as:
  - `@hermes/readiness`
  - part of `@hermes/observability`
  - `repo-template v2` baseline
- Keep `hermes-observability` as the source of truth until extraction

## Pilot Results Update

### Completed Pilots

| Repo | Role | Result | Notes |
| --- | --- | --- | --- |
| `ai-ops-console` | active app/product repo | passed | Required `.cjs` script naming and lint ignore. |
| `ops-clarity-sprint` | active Hermes/operator repo | passed | Integrated cleanly with existing `check` script. |
| `repo-template` | baseline template repo | passed | Added `package.json` and proved readiness can be part of repo baseline. |

### Updated Interpretation

The third pilot changes the decision from "wait for more evidence" to "prepare extraction carefully."

The evidence now supports extraction planning, but not a rushed package extraction. The next step should be a package-boundary design note, not immediate implementation.

### Updated Recommendation

Create a follow-up decision/design document for one of:

1. `@hermes/readiness`
2. `@hermes/observability` submodule
3. `repo-template v2` generated baseline

Recommended next step: draft the package boundary and source-of-truth update flow before replacing copied assets.
