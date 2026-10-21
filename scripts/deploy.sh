#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm ci
npm run build

if pm2 describe fasilkenema >/dev/null 2>&1; then
  pm2 restart fasilkenema --update-env
else
  pm2 start npm --name fasilkenema -- start
fi

pm2 save
