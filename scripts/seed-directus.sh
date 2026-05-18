#!/usr/bin/env bash
# Seed a fresh Directus instance with schema + data.
# Usage: DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=xxx ./scripts/seed-directus.sh
#
# Prerequisites:
#   - Directus is running and accessible
#   - A valid admin/static token is set
#
# This script is idempotent for schema (applies snapshot diff),
# but will DUPLICATE data if run twice. Use on a fresh instance.

set -euo pipefail

URL="${DIRECTUS_URL:-http://localhost:8055}"
TOKEN="${DIRECTUS_TOKEN:?Set DIRECTUS_TOKEN}"
AUTH="Authorization: Bearer $TOKEN"

echo "==> Targeting Directus at $URL"

# ── 1. Apply schema snapshot ────────────────────────────────────
echo "==> Applying schema snapshot..."
SNAPSHOT=$(cat "$(dirname "$0")/../directus-snapshot.json")
DIFF=$(curl -sf -X POST "$URL/schema/diff" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "$SNAPSHOT")

HASH=$(echo "$DIFF" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('hash',''))" 2>/dev/null || true)

if [ -n "$HASH" ]; then
  curl -sf -X POST "$URL/schema/apply" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "$DIFF" > /dev/null
  echo "    Schema applied (hash: $HASH)"
else
  echo "    Schema already up to date"
fi

# ── Helper ──────────────────────────────────────────────────────
post() {
  local collection="$1"
  local data="$2"
  curl -sf -X POST "$URL/items/$collection" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "$data" > /dev/null
  echo "    Seeded $collection"
}

patch_singleton() {
  local collection="$1"
  local data="$2"
  curl -sf -X PATCH "$URL/items/$collection" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "$data" > /dev/null
  echo "    Seeded $collection (singleton)"
}

# ── 2. site_settings (singleton) ────────────────────────────────
echo "==> Seeding site_settings..."
patch_singleton site_settings '{
  "color_bg": "#ffffff",
  "color_text": "#2e2e2e",
  "color_muted": "#646464",
  "color_surface": "#c7c7c7",
  "color_button": "#e8e8e8",
  "color_button_text": "#000000",
  "color_button_hover": "#d9d9d9",
  "color_header": "#ffffff",
  "color_border": "#c7c7c7",
  "color_footer_bg": "#f6f6f6",
  "font_family": "",
  "logo_text": "Tabernam",
  "max_width": "1512px",
  "side_padding": "40px",
  "header_height": "60px"
}'

# ── 3. contact_addresses ────────────────────────────────────────
echo "==> Seeding contact_addresses..."
post contact_addresses '[
  {"title_en":"Address 1","title_sk":"Adresa 1","lines":"Quam adipiscing vestibulum id tristique.\nPenatibus lacus luctus magna laoreet torquent curae integer ultricies.\nSagittis vehicula aenean nascetur augue e inceptos.\nBlandit faucibus interdum","portrait_index":1,"sort":1},
  {"title_en":"Address 2","title_sk":"Adresa 2","lines":"Quam adipiscing vestibulum id tristique.\nPenatibus lacus luctus magna laoreet torquent curae integer ultricies.\nSagittis vehicula aenean nascetur augue e inceptos.\nBlandit faucibus interdum","portrait_index":2,"sort":2},
  {"title_en":"Address 3","title_sk":"Adresa 3","lines":"Quam adipiscing vestibulum id tristique.\nPenatibus lacus luctus magna laoreet torquent curae integer ultricies.\nSagittis vehicula aenean nascetur augue e inceptos.\nBlandit faucibus interdum","portrait_index":3,"sort":3}
]'

# ── 4. i18n_strings ─────────────────────────────────────────────
echo "==> Seeding i18n_strings..."
post i18n_strings '[
  {"key":"page.title.home","en":"TABERNAM","sk":"TABERNAM"},
  {"key":"page.title.about","en":"About me — TABERNAM","sk":"O mne — TABERNAM"},
  {"key":"page.title.business","en":"Business — TABERNAM","sk":"Biznis — TABERNAM"},
  {"key":"page.title.contact","en":"Contact — TABERNAM","sk":"Kontakt — TABERNAM"},
  {"key":"nav.contact","en":"Contact","sk":"Kontakt"},
  {"key":"nav.about","en":"About me","sk":"O mne"},
  {"key":"nav.activity","en":"Activity","sk":"Aktivita"},
  {"key":"nav.home","en":"Home","sk":"Domov"},
  {"key":"btn.getStarted","en":"Get started","sk":"Začať"},
  {"key":"btn.viewCities","en":"View cities","sk":"Zobraziť mestá"},
  {"key":"btn.goBack","en":"Go back","sk":"Späť"},
  {"key":"btn.learnMore","en":"Learn more","sk":"Zistiť viac"},
  {"key":"btn.viewCV","en":"View my CV","sk":"Zobraziť životopis"},
  {"key":"heading.aboutMe","en":"About me","sk":"O mne"},
  {"key":"heading.contact","en":"Contact","sk":"Kontakt"},
  {"key":"footer.navigation","en":"Navigation","sk":"Navigácia"},
  {"key":"footer.contact","en":"Contact","sk":"Kontakt"},
  {"key":"footer.copyright","en":"© 2026 Tabernam. All rights reserved.","sk":"© 2026 Tabernam. Všetky práva vyhradené."},
  {"key":"contact.address1","en":"Address 1","sk":"Adresa 1"},
  {"key":"contact.address2","en":"Address 2","sk":"Adresa 2"},
  {"key":"contact.address3","en":"Address 3","sk":"Adresa 3"},
  {"key":"aria.prevCity","en":"Previous city","sk":"Predchádzajúce mesto"},
  {"key":"aria.nextCity","en":"Next city","sk":"Ďalšie mesto"},
  {"key":"aria.cities","en":"Cities","sk":"Mestá"},
  {"key":"aria.footerNav","en":"Footer navigation","sk":"Navigácia v päte stránky"}
]'

# ── 5. page_texts ───────────────────────────────────────────────
echo "==> Seeding page_texts..."
post page_texts '[
  {"page":"home","section":"hero_title","content":"Lorem ipsum dolor sit consectetur adipiscing elit"},
  {"page":"home","section":"hero_body","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
  {"page":"home","section":"quote_en","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
  {"page":"home","section":"quote_zh","content":"罗马假名痛苦坐在这里，构成了一个精致的学术界。为了工作和痛苦的巨大利益，进行了一些临时的工作。为了最小化请求，谁也不想进行不必要的劳动，除非是为了获得某种便利。"},
  {"page":"about","section":"about_body","content":"Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac."},
  {"page":"business","section":"business_title","content":"Lorem ipsum dolor"},
  {"page":"business","section":"business_body_1","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
  {"page":"business","section":"business_body_2","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
  {"page":"business","section":"business_body_3","content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
  {"page":"contact","section":"contact_body","content":"Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac."}
]'

echo ""
echo "==> Done! All seed data inserted."
echo "    Admin panel: $URL/admin"
