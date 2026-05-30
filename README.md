# Hermes Observability

Local observability layer for Hermes agent runs, repo reviews, release checks, prompt experiments, and evaluation traces.

## Local Langfuse

Langfuse runs at:

```text
http://localhost:3000
```

Expected env file:

```txt
~/.config/hermes/langfuse.env
```

## Smoke Test

```bash
source ~/.config/hermes/langfuse.env
npm run trace:smoke
```

Expected Langfuse trace:

```txt
hermes-observability-smoke
```
