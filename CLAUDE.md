# pockettype – Hinweise für Claude

Tipptrainer für den Unterricht (Realschule), Fork von Monkeytype über monkeytype-desktop (siehe README.md).
Läuft als Bereich „Tastaturschreiben“ in vibe learning (Nachbar-Repo `../vibe-learning`, eigene CLAUDE.md dort).

## Arbeitsweise

- Antworten knapp und auf Deutsch. Vorschläge kritisch hinterfragen, bessere Wege nennen.
- Umgesetzt wird nur, was die Lehrkraft freigibt. Wünsche stehen in `../vibe-learning/notizen/fehlerliste.md`.
- Eigener Code nach `frontend/src/ts/pockettype/` (Kopfkommentar mit Beschreibung wie in vibe learning).
  In Monkeytype-Dateien nur kleine Eingriffe, jeweils mit Kommentar `pockettype:`.
- Gebaut wird immer im Desktop-Modus (`MONKEYTYPE_DESKTOP=true`, `envConfig.isDesktop`). Der normale
  Web-Modus von Monkeytype wird nicht gepflegt.
- Kein Update auf neue Monkeytype-Versionen; einzelne Korrekturen höchstens per `git cherry-pick`
  (Remotes `upstream` = Monkeytype, `desktop` = monkeytype-desktop, nur lokal).

## Wichtige Stellen

- `pockettype/i18n.ts`, `pockettype/locales/de.ts`: Übersetzung (`t()`, `data-i18n` im HTML)
- `pockettype/anschlaege.ts`: Anschläge (gezählt in `utils/strings.ts` countChars)
- `pockettype/theme.ts`: vibe_light/vibe_dark, folgt `data-theme` und `wenn-theme` von vibe learning
- `pockettype/sync.ts`: Abgleich mit PocketBase (Server: `../vibe-learning/pb_hooks/tippen.pb.js`)
- `pockettype/vibe.ts`: Tastatur/Fokus für Menüleiste und Anmeldung von vibe learning
- `desktop/route-controller.ts`: Unterseiten über `#/settings` usw.
- `scripts/pockettype/ausduennen.py`, `scripts/pockettype/nach-vibe-learning.sh`

## Nach jeder Änderung

1. `pnpm ts-check` (Fehler zu `firebase-config` ist bekannt) und Tests: `cd frontend && pnpm exec vitest run`.
2. Im Browser testen: `scripts/pockettype/nach-vibe-learning.sh ../vibe-learning`, dann in vibe-learning
   PocketBase starten und `/tippen/pockettype.html` öffnen. Nicht getestet? Dann klar sagen.
3. Committen mit kurzer deutscher Nachricht (pre-commit-Hook formatiert und prüft). In vibe-learning
   den neuen Build in `pb_public/tippen/` mitcommitten.
