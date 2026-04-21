#!/usr/bin/env bash
# Safely deploy go-rabbit-web to the Mac Mini.
#
# Usage:   ./scripts/deploy.sh
# Env overrides (optional):
#   DEPLOY_SSH_TARGET   default: white@100.97.115.18
#   DEPLOY_APP_DIR      default: /Users/white/apps/go-rabbit-web
#   DEPLOY_PM2_NAME     default: go-rabbit-web
#
# Fails loudly on the first error. The remote build is run BEFORE the
# pm2 restart, so a broken build can never leave pm2 in a crash loop —
# the old process keeps serving until the new one is known to be good.

set -euo pipefail

SSH_TARGET="${DEPLOY_SSH_TARGET:-white@100.97.115.18}"
APP_DIR="${DEPLOY_APP_DIR:-/Users/white/apps/go-rabbit-web}"
PM2_NAME="${DEPLOY_PM2_NAME:-go-rabbit-web}"
PUBLIC_URL="${DEPLOY_PUBLIC_URL:-https://gorunrabbit.com/}"

step() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
fail() { printf "\n\033[1;31mFAIL: %s\033[0m\n" "$*" >&2; exit 1; }

cd "$(git rev-parse --show-toplevel)"

# ── Local pre-flight ────────────────────────────────────────────────
step "Typecheck"
npm run typecheck

step "Lint (next lint — same rules that run during next build)"
npm run lint

step "Tests"
npm test --silent

step "Checking for uncommitted changes"
if ! git diff --quiet || ! git diff --quiet --cached; then
  fail "Working tree dirty — commit or stash before deploying."
fi

# Show what we're about to ship
step "Changes to ship"
git fetch origin --quiet
ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
if [ "$ahead" = "0" ]; then
  echo "(nothing new — redeploying $(git rev-parse --short HEAD))"
else
  git log --oneline origin/main..HEAD
fi

step "Pushing to origin"
git push origin HEAD

# ── Remote deploy ───────────────────────────────────────────────────
step "Remote: pull + install + build + restart"
ssh "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
export PATH=/opt/homebrew/bin:\$PATH
cd "$APP_DIR"

echo "-> git pull"
git pull --ff-only origin main

echo "-> npm install (sync to package-lock)"
npm install --no-audit --no-fund

echo "-> rm -rf .next"
rm -rf .next

echo "-> npm run build"
# next build exits non-zero on lint errors / compilation failures. set -e
# will abort the whole SSH session before we touch pm2.
npm run build
test -f .next/BUILD_ID || { echo "FAIL: .next/BUILD_ID missing after build" >&2; exit 1; }

echo "-> pm2 restart (or start if it's been dropped)"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" -- start
fi
pm2 save

echo "-> waiting for localhost:3102 to come up"
code=000
for i in 1 2 3 4 5 6 7 8; do
  code=\$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3102/ || echo 000)
  if [ "\$code" = "200" ]; then
    echo "OK: localhost:3102 -> \$code"
    break
  fi
  echo "   attempt \$i: \$code"
  sleep 2
done

if [ "\$code" != "200" ]; then
  echo "FAIL: localhost:3102 not serving 200 after restart. Recent logs:" >&2
  pm2 logs "$PM2_NAME" --lines 40 --nostream >&2 || true
  exit 1
fi
REMOTE

# ── Public smoke test ───────────────────────────────────────────────
step "Public smoke test: $PUBLIC_URL"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PUBLIC_URL" || echo 000)
if [ "$code" != "200" ]; then
  fail "Public URL $PUBLIC_URL returned $code (local was fine — check the tunnel)"
fi
echo "OK: $PUBLIC_URL -> $code"

step "Deployed $(git rev-parse --short HEAD)"
