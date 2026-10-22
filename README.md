# Hermes Observability

![CI](https://github.com/zacharymplace/hermes-observability/actions/workflows/ci.yml/badge.svg)

Shared observability standards and readiness validation for governed software
workflows. Inspect trace metadata, privacy defaults, and artifact evidence before
connecting a project to an observability service.

## First run: local fixture validation

Requires Git, Node.js 22 or newer, and npm. These commands use built-in Node
modules and committed fixtures; dependency installation, Langfuse credentials,
and a running observability server are not required for this first pass.

```bash
git clone https://github.com/zacharymplace/hermes-observability.git
cd hermes-observability
npm run standards:check
npm run hermes:readiness
npm run test:readiness
```

Expected output, with npm's command headings omitted:

```text
Hermes observability standards valid
Hermes readiness status: PASS
JSON report: reports/readiness/latest-readiness.json
Markdown report: reports/readiness/latest-readiness.md
Hermes readiness validator tests passed.
```

Open the generated Markdown report to inspect the checks and findings. The
readiness command overwrites the two `latest-readiness` reports. By default it
validates `fixtures/readiness/valid-agent-trace.json` against
`standards/readiness.json`; PASS means that fixture satisfies those checks.
It does not establish production readiness, trace delivery, or another
repository's compliance.

## Prototype boundary

This v0.1 repository provides standards, local validators, and integration
helpers. A valid fixture and a passing local check are separate from a live
Langfuse ingestion test or a successful operational pilot. Repository-wide
helpers may assume the maintainer's environment; start with the local commands
above. See the [readiness runbook](docs/runbooks/hermes-readiness.md) and
[instrumentation guide](docs/instrumentation-guide.md).

## Additional commands

```bash
npm run standards:check
npm run check
npm run trace:smoke
npm run hermes:observe
npm run ci:summary
```

## Standard Events

- command-result
- review-summary
- release-lineage
- final-disposition

## Standard Scores

- readiness
- risk
- confidence

## Optional Langfuse integration

Install dependencies with `npm ci`. Follow the
[local Langfuse runbook](docs/runbooks/local-langfuse.md) to start and configure
your instance. `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, and `LANGFUSE_HOST`
must be set for `trace:smoke`; no credentials are bundled.

After configuring your own local environment file:

```bash
source ~/.config/hermes/langfuse.env
npm run hermes:observe
```

`npm run check` validates and exports the standard before `trace:smoke` reads
`dist/hermes-observability-standard.json`. To test ingestion separately, run
`npm run check` then `npm run trace:smoke` with your Langfuse environment loaded.
The smoke command sends a synthetic trace to the configured host; inspect it
in Langfuse to confirm receipt. `ci:summary` and `hermes:observe` also depend on
the GitHub CLI and its authentication; they are not the offline first-run path.
