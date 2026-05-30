# Hermes Observability

![CI](https://github.com/zacharymplace/hermes-observability/actions/workflows/ci.yml/badge.svg)

Shared observability standard for Hermes-aligned repos.

## Local Commands

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

## Local Langfuse

```bash
source ~/.config/hermes/langfuse.env
npm run hermes:observe
```
