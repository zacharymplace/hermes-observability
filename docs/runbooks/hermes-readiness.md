# Hermes Agent/MCP Observability Readiness

## Purpose

The readiness check validates whether an AI/app repo has the minimum metadata and privacy defaults needed for agent observability, evaluation, and auditability.

## Command

```bash
npm run hermes:readiness
```

## Outputs

```txt
reports/readiness/latest-readiness.json
reports/readiness/latest-readiness.md
```

## Current Scope

The first version validates a fixture trace against:

- required trace metadata
- recommended trace metadata
- privacy-safe logging defaults
- artifact metadata envelope
- JSON report generation
- Markdown report generation

## Pilot Repos

Use this readiness check as the starting point for pilots in:

- ai-ops-console
- sentra

## Extraction Rule

Keep this inside `hermes-observability` until two repo pilots pass.

Only extract to a shared package after the pilot proves the interface is stable.
