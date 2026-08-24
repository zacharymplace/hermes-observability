# Hermes Readiness Package Distribution Runbook

## Preconditions

Run from hermes-observability:

npm run readiness:package:smoke
npm run test:readiness:package
npm run test:readiness:package:paths
npm run readiness:package-version:audit
npm run check
npm run readiness:drift

## Step 1: Pack Package

npm pack ./packages/readiness

## Step 2: Pilot in repo-template

cd ~/dev/repo-template

npm install --save-dev ../hermes-observability/hermes-readiness-*.tgz
npm run hermes:readiness
npm run check

## Step 3: Audit Current Consumers

From `hermes-observability`:

```text
npm run readiness:drift
npm run readiness:package-version:audit
```

Expected current state:

- repo-template: match
- sentra: match
- ai-ops-console: match

## Step 4: Validate Consumers

For each consumer, run:

```
npm run hermes:readiness
npm run check
```
## Done Criteria

- repo-template uses installed @hermes/readiness
- sentra uses installed @hermes/readiness
- ai-ops-console uses installed @hermes/readiness
- package version audit reports three matches
