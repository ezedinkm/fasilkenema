#!/usr/bin/env bash
set -euo pipefail

npm ci --no-audit --no-fund

# drizzle.config.ts targets NEON_DATABASE_URL only when NODE_ENV is development.
NODE_ENV=development npm run db:push

npm run build
