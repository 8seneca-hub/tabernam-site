#!/usr/bin/env bash
# Seed (or re-seed) a Directus instance from this repo's snapshot + JSON dumps.
#
# Usage:
#   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=tabernam-admin-token \
#     ./scripts/seed-directus.sh
#
# Most contributors do NOT need to run this. `database/data.db` and `uploads/`
# are committed, so `docker compose up` after `git clone` restores the full
# Directus state directly. Run this script only when:
#   - You wiped `database/data.db` and want to rebuild the relational layer
#   - You're spinning Directus against a brand-new storage backend
#   - You want to verify the snapshot + dumps reproduce the live state
#
# What this script does, in order:
#   1. Apply the schema snapshot (`directus-snapshot.json`) via /schema/diff
#   2. PATCH the `site_settings` singleton from `seed-data/site_settings.json`
#   3. POST each collection's JSON dump under `seed-data/<collection>.json`
#
# Note on assets: rows like `hero_slides.image`, `activities.photos.*`,
# `page_texts.content` (image sections) and the `portrait_image_*` rows
# reference Directus file UUIDs. Those UUIDs only resolve if the matching
# rows already exist in `directus_files` AND the binaries are present in
# `uploads/`. Since both `data.db` and `uploads/` are committed, that's the
# normal path. For a truly-empty Directus you would need to re-import the
# files first via /files (and preserve their UUIDs).

set -euo pipefail

URL="${DIRECTUS_URL:-http://localhost:8055}"
TOKEN="${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN}"
AUTH="Authorization: Bearer $TOKEN"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEED_DIR="$ROOT/scripts/seed-data"

echo "==> Targeting Directus at $URL"

# ── 1. Apply schema snapshot ────────────────────────────────────
echo "==> Applying schema snapshot..."
DIFF=$(curl -sf -X POST "$URL/schema/diff" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data-binary "@$ROOT/directus-snapshot.json")

HASH=$(echo "$DIFF" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('hash','') if d else '')" 2>/dev/null || true)

if [ -n "$HASH" ]; then
  curl -sf -X POST "$URL/schema/apply" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "$DIFF" > /dev/null
  echo "    Schema applied (hash: $HASH)"
else
  echo "    Schema already up to date"
fi

# ── Helpers ─────────────────────────────────────────────────────
post_file() {
  local coll="$1"
  local file="$SEED_DIR/$coll.json"
  if [ ! -s "$file" ]; then
    echo "    skip $coll (missing $file)"
    return
  fi
  curl -sf -X POST "$URL/items/$coll" \
    -H "$AUTH" -H "Content-Type: application/json" \
    --data-binary "@$file" > /dev/null
  local count
  count=$(python3 -c "import json; print(len(json.load(open('$file'))))")
  echo "    Seeded $coll ($count rows)"
}

patch_singleton() {
  local coll="$1"
  local file="$SEED_DIR/$coll.json"
  if [ ! -s "$file" ]; then
    echo "    skip $coll (missing $file)"
    return
  fi
  curl -sf -X PATCH "$URL/items/$coll" \
    -H "$AUTH" -H "Content-Type: application/json" \
    --data-binary "@$file" > /dev/null
  echo "    Seeded $coll (singleton)"
}

# ── 2. Singleton ────────────────────────────────────────────────
echo "==> Seeding site_settings..."
patch_singleton site_settings

# ── 3. Plain collections ────────────────────────────────────────
# Activities last — they POST with nested translations + photos so the
# junction rows get created in the same call.
echo "==> Seeding collections..."
for coll in i18n_strings page_texts hero_slides contact_addresses contact_offices activities; do
  post_file "$coll"
done

echo ""
echo "==> Done."
echo "    Admin panel: $URL/admin"
