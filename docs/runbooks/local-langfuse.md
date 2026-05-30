# Local Langfuse Runbook

## Start

```bash
cd ~/dev/langfuse
docker compose -f docker-compose.local.yml up -d
```

## Check

```bash
docker compose -f docker-compose.local.yml ps
```

## Logs

```bash
docker compose -f docker-compose.local.yml logs -f langfuse-web
```

## Stop

```bash
docker compose -f docker-compose.local.yml down
```

## Smoke Test

```bash
cd ~/dev/hermes-observability
source ~/.config/hermes/langfuse.env
npm run trace:smoke
```
