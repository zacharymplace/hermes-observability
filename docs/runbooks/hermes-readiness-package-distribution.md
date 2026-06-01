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

## Step 3: Update Version Audit

cd ~/dev/hermes-observability

npm run readiness:package-version:audit

Expected bridge state:

- repo-template: match
- ops-clarity-sprint: shim_pending_package
- ai-ops-console: shim_pending_package

## Step 4: Migrate Remaining Repos

Migrate in this order:

1. ops-clarity-sprint
2. ai-ops-console

For each repo:

npm install --save-dev PACKAGE_SOURCE
npm run hermes:readiness
npm run check

Then remove temporary shim:

git rm scripts/hermes-readiness-package-shim.cjs

## Done Criteria

- repo-template uses installed @hermes/readiness
- ops-clarity-sprint uses installed @hermes/readiness
- ai-ops-console uses installed @hermes/readiness
- package version audit reports three matches
- temporary shims are removed
