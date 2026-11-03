#!/usr/bin/env bash
# Baut pockettype für vibe learning und kopiert es nach <vibe-learning>/pb_public/tippen/.
#
# Aufruf im Hauptordner von pockettype:
#   scripts/pockettype/nach-vibe-learning.sh ../vibe-learning
#
# Die Seite heißt dort pockettype.html. Die Bereichsseite tippen/index.html gehört
# zu vibe learning und bleibt erhalten; alles andere in tippen/ wird ersetzt.
# Braucht Node 24 und pnpm (siehe package.json, "engines").
set -euo pipefail

ZIEL_REPO="${1:?Pfad zu vibe-learning angeben, z. B. ../vibe-learning}"
ZIEL="$(cd "$ZIEL_REPO" && pwd)/pb_public/tippen"
HIER="$(cd "$(dirname "$0")/../.." && pwd)"

[ -f "$ZIEL/../katalog.js" ] || { echo "Kein vibe-learning unter $ZIEL_REPO (pb_public/katalog.js fehlt)"; exit 1; }

cd "$HIER"
POCKETTYPE_BASE=/tippen/ pnpm build-pockettype

mkdir -p "$ZIEL"
find "$ZIEL" -mindepth 1 -maxdepth 1 ! -name index.html -exec rm -rf {} +
cp -r frontend/dist/. "$ZIEL/"
mv "$ZIEL/desktop.html" "$ZIEL/pockettype.html"
echo "pockettype nach $ZIEL kopiert ($(du -sh "$ZIEL" | cut -f1))"
