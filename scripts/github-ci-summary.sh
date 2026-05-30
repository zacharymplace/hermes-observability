#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-zacharymplace/hermes-observability}"
BRANCH="${2:-main}"
URL="https://api.github.com/repos/${REPO}/actions/runs?branch=${BRANCH}&per_page=5"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

for attempt in 1 2 3; do
  curl -fsS \
    -H "Authorization: Bearer $(gh auth token)" \
    -H "Accept: application/vnd.github+json" \
    "$URL" > "$TMP" && jq empty "$TMP" 2>/dev/null && break

  if [ "$attempt" = "3" ]; then
    echo "Failed to fetch valid GitHub Actions JSON after 3 attempts" >&2
    cat "$TMP" >&2 || true
    exit 1
  fi

  sleep 2
done

jq -r '.workflow_runs[]? | "\(.name) #\(.run_number) | \(.status) | \(.conclusion // "pending") | \(.head_sha[0:7]) | \(.display_title)"' "$TMP"
