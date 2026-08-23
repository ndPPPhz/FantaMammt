#!/usr/bin/env bash
# Re-deploy FantaMammt on the server: pulls the latest changes, installs
# dependencies, and restarts the systemd service.
#
# Run this from the server, inside the cloned repo (or anywhere, it
# resolves its own location), AFTER the one-time first setup has already
# been done by hand: clone, .env configured, `npm run seed`, unit file
# installed and enabled (see deploy/fantamammt.service and README.md).
#
# IMPORTANT: this script never touches the database or re-runs the seed.
# Re-seeding after the season has started would wipe all votes and
# confirmations already recorded.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="fantamammt"

cd "$APP_DIR"

echo "==> Pulling latest changes in $APP_DIR..."
git pull --ff-only

echo "==> Installing dependencies..."
npm install --omit=dev

echo "==> Restarting $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

echo "==> Done. Status:"
sudo systemctl status "$SERVICE_NAME" --no-pager -l
