#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# npm ci is often killed on a 1 GB VPS. "Exit handler never called" is that crash.
if [ "$(id -u)" -eq 0 ] && ! swapon --show | grep -q .; then
  if [ ! -f /swapfile ]; then
    if ! fallocate -l 1G /swapfile 2>/dev/null; then
      dd if=/dev/zero of=/swapfile bs=1M count=1024
    fi
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
  if ! grep -q '^/swapfile ' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi

export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false
export npm_config_maxsockets=3

free -h || true
rm -rf node_modules

attempt=1
until npm ci --no-audit --no-fund --foreground-scripts; do
  if [ "$attempt" -ge 2 ]; then
    echo "npm ci failed"
    exit 1
  fi
  attempt=$((attempt + 1))
  echo "npm ci failed, retrying..."
  rm -rf node_modules
done

npm run build

if pm2 describe fasilkenema >/dev/null 2>&1; then
  pm2 restart fasilkenema --update-env
else
  pm2 start npm --name fasilkenema -- start
fi

pm2 save
