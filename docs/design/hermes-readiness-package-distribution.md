# Hermes Readiness Package Distribution Design

## Purpose

Define how @hermes/readiness moves from scaffold package to installable package.

## Current State

The package scaffold exists under packages/readiness and now has package-local defaults, CLI tests, downstream package-style pilots, and package version audit scaffolding.

## Distribution Goal

Downstream repos should eventually use:

npm install --save-dev @hermes/readiness

And package scripts should use:

"hermes:readiness": "hermes-readiness"

## Package Ownership

@hermes/readiness owns:

- CLI execution
- default readiness standard
- default readiness fixture
- JSON report generation
- Markdown report generation
- validation rules
- package version identity

It does not own downstream repo-specific CI, check scripts, or governance policy.

## Distribution Options

1. Public npm package
2. GitHub Packages
3. Local package tarball pilot

Recommendation: pilot with a local package tarball first, then publish once repo-template succeeds.

## Migration Sequence

1. Pack @hermes/readiness locally.
2. Install into repo-template.
3. Validate npm run hermes:readiness.
4. Validate npm run check.
5. Update package version audit.
6. Migrate ops-clarity-sprint.
7. Migrate ai-ops-console.
8. Remove temporary shims.
9. Promote package version audit as the primary downstream consistency check.

## Acceptance Criteria

- package-local tests pass
- repo-template uses installed package
- package version audit detects installed version
- downstream shim can be removed safely
