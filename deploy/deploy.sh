#!/usr/bin/env bash
# Re-deploy FantaMammt on the server: pulls the latest changes, installs
# dependencies, and restarts the systemd service.
#
# Run this as your own sudo-capable user (NOT as the `fantamammt` service
# account, which has no shell/sudo rights), from anywhere - it resolves
# its own location. Requires that the one-time first setup has already
# been done by hand: dedicated user + directory created and chowned,
# clone, .env configured, `npm run seed`, unit file installed and enabled
# (see deploy/fantamammt.service and README.md).
#
# IMPORTANT: this script never touches the database or re-runs the seed.
# Re-seeding after the season has started would wipe all votes and
# confirmations already recorded.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="fantamammt"
SERVICE_USER="fantamammt"

# git/npm run as the service user so the checkout (owned by fantamammt,
# see README) keeps consistent ownership; only the service restart needs
# your own sudo rights.
echo "==> Pulling latest changes in $APP_DIR..."
sudo -u "$SERVICE_USER" git -C "$APP_DIR" pull --ff-only

echo "==> Installing dependencies..."
sudo -u "$SERVICE_USER" npm --prefix "$APP_DIR" install --omit=dev

echo "==> Restarting $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

echo "==> Done. Status:"
sudo systemctl status "$SERVICE_NAME" --no-pager -l
