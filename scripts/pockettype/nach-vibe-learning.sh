#!/usr/bin/env bash
# Baut pockettype für vibe learning und kopiert es nach <vibe-learning>/pb_public/tippen/.
#
# Aufruf im Hauptordner von pockettype:
#   scripts/pockettype/nach-vibe-learning.sh ../vibe-learning
#
# Die Seite heißt dort pockettype.html, dazu lektionen.html („Lektion üben“) und aufgabe.html
# („Aufgabe“), jeweils dieselbe Seite mit anderem data-pt. Die Bereichsseite tippen/index.html gehört
# zu vibe learning und bleibt erhalten; alles andere in tippen/ wird ersetzt.
# Dazu kommen LICENSE.txt und QUELLE.txt (Herkunft, Commit).
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
# Lektionsseite: dieselbe Seite mit data-pt="lektionen" (pockettype/lektionen.ts) und eigener Tool-id
sed 's/<html lang="de" data-trainer="tippen">/<html lang="de" data-trainer="lektionen" data-pt="lektionen">/' "$ZIEL/pockettype.html" > "$ZIEL/lektionen.html"
grep -q 'data-pt="lektionen"' "$ZIEL/lektionen.html" || { echo "lektionen.html: data-pt nicht gesetzt"; exit 1; }
# Aufgabenseite: Text der Lehrkraft abschreiben (pockettype/aufgabe.ts)
sed 's/<html lang="de" data-trainer="tippen">/<html lang="de" data-trainer="tippaufgabe" data-pt="aufgabe">/' "$ZIEL/pockettype.html" > "$ZIEL/aufgabe.html"
grep -q 'data-pt="aufgabe"' "$ZIEL/aufgabe.html" || { echo "aufgabe.html: data-pt nicht gesetzt"; exit 1; }
# GPL-3.0: Lizenz und Hinweis auf den Quellcode gehören zu den ausgelieferten Dateien
cp LICENSE "$ZIEL/LICENSE.txt"
printf 'pockettype – gebaut aus https://github.com/nic0nic/pockettype (Commit %s)\nbasiert auf Monkeytype (https://github.com/monkeytypegame/monkeytype) und monkeytype-desktop\nLektionen (lektionen/): TIPP10 2.1.0, Tom Thielicke IT Solutions, GPL-2.0, siehe lektionen/LICENSE-TIPP10.txt\nLizenz: GPL-3.0, siehe LICENSE.txt. Nicht von Hand ändern, sondern im pockettype-Repo\nscripts/pockettype/nach-vibe-learning.sh ausführen.\n' "$(git rev-parse --short HEAD)" > "$ZIEL/QUELLE.txt"
echo "pockettype nach $ZIEL kopiert ($(du -sh "$ZIEL" | cut -f1))"
