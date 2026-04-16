#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-}"
SYSTEMD_SCOPE="${SYSTEMD_SCOPE:-system}"

log() {
  printf '[deploy] %s\n' "$1"
}

fail() {
  printf '[deploy] %s\n' "$1" >&2
  exit 1
}

cd "$APP_DIR"

if [[ ! -f package.json ]]; then
  fail "package.json not found in $APP_DIR"
fi

if [[ ! -f .env ]]; then
  fail "Missing .env in $APP_DIR. Keep production secrets on the VPS before deploying."
fi

export NODE_ENV=production

log "Installing dependencies"
npm ci

log "Building Next.js application"
npm run build

log "Applying Prisma migrations"
npx prisma migrate deploy

if [[ -z "$SERVICE_NAME" ]]; then
  fail "SERVICE_NAME is not set"
fi

if [[ "$SYSTEMD_SCOPE" == "user" ]]; then
  log "Restarting user service $SERVICE_NAME"
  systemctl --user restart "$SERVICE_NAME"
  systemctl --user status "$SERVICE_NAME" --no-pager
else
  log "Restarting system service $SERVICE_NAME"
  sudo systemctl restart "$SERVICE_NAME"
  sudo systemctl status "$SERVICE_NAME" --no-pager
fi

log "Deployment finished successfully"
