#!/bin/bash
# Wrapper for scripts/oddyssey-food-pull.ts — sources .env.local and runs.
# Used by cron on the Mac Mini. Accepts all the same args as the .ts script.
set -a
source "$(dirname "$0")/../.env.local"
set +a
export PATH=/Users/white/.nvm/versions/node/v22.22.0/bin:$PATH
cd "$(dirname "$0")/.."
npx tsx scripts/oddyssey-food-pull.ts "$@"
