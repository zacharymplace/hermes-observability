# Observability

This repo defines the shared Hermes observability standard and emits local
validation traces to Langfuse Cloud (`LANGFUSE_HOST` in
`~/.config/hermes/langfuse.env`).

## Env

source ~/.config/hermes/langfuse.env

## Local Loop

npm run hermes:observe

## Standard Events

- command-result
- review-summary
- release-lineage
- final-disposition

## Standard Scores

- readiness
- risk
- confidence
