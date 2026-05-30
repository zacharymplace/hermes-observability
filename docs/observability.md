# Observability

This repo defines the shared Hermes observability standard and emits local validation traces to self-hosted Langfuse.

## Langfuse Local

http://localhost:3000

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
