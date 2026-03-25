#!/usr/bin/env bash
set -euo pipefail

cd /repo

export XCLAW_STATE_DIR="/tmp/xclaw-test"
export XCLAW_CONFIG_PATH="${XCLAW_STATE_DIR}/xclaw.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${XCLAW_STATE_DIR}/credentials"
mkdir -p "${XCLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${XCLAW_CONFIG_PATH}"
echo 'creds' >"${XCLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${XCLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm xclaw reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${XCLAW_CONFIG_PATH}"
test ! -d "${XCLAW_STATE_DIR}/credentials"
test ! -d "${XCLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${XCLAW_STATE_DIR}/credentials"
echo '{}' >"${XCLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm xclaw uninstall --state --yes --non-interactive

test ! -d "${XCLAW_STATE_DIR}"

echo "OK"
