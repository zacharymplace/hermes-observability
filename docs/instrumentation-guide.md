# Hermes Observability Instrumentation Guide

## Purpose

Hermes observability records review runs, command outcomes, release lineage, and final dispositions in Langfuse.

## Standard Events

- command-result
- review-summary
- release-lineage
- final-disposition

## Standard Scores

- readiness
- risk
- confidence

## Standard Commands

Every repo should eventually expose:

- npm run check
- npm run ci:summary
- npm run trace:review
- npm run hermes:observe

## Local Environment

Expected env file:

~/.config/hermes/langfuse.env

## Recommended Trace Shape

Trace:

hermes-review-run

Events:

1. command-result
2. review-summary
3. release-lineage
4. final-disposition

Scores:

1. readiness
2. risk
3. confidence
