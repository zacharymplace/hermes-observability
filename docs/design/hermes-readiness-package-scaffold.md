# Hermes Readiness Package Scaffold

## Purpose

Create a concrete extraction target for `@hermes/readiness` without migrating downstream repos yet.

## Current Scaffold

```text
packages/readiness/
  package.json
  README.md
  bin/hermes-readiness.cjs
  src/index.cjs
  standards/readiness.json
  fixtures/valid-agent-trace.json
```

## Scaffold Behavior

The package scaffold currently points back to the root implementation:

- CLI delegates to `scripts/hermes-readiness.js`
- module entry delegates to `lib/readiness`
- standards and fixtures are copied snapshots

This keeps package extraction reversible while the boundary is tested.

## Not Yet Done

Do not trust this as a real extracted package yet.

Still pending:

- package-local CLI implementation
- package-local tests
- package-local fixture path defaults
- package version release workflow
- downstream migration from copied scripts
- repo-template package usage pilot

## Recommended Next Step

Add package-local tests and make the package scaffold run independently from root scripts.
