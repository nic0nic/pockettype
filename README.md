# pockettype

Tipptrainer für den Unterricht. Gemessen werden Wörter und Anschläge pro Minute,
Genauigkeit und Gleichmäßigkeit; Bestwerte und Verlauf bleiben erhalten.
pockettype läuft als Bereich „Tastaturschreiben“ in der Übungsplattform
[vibe learning](https://github.com/nic0nic/vibe-learning). Angemeldete Schüler
speichern ihre Ergebnisse dort in PocketBase, die Lehrkraft sieht sie in der Verwaltung.

## Herkunft und Lizenz

pockettype ist eine angepasste Fassung von

- [Monkeytype](https://github.com/monkeytypegame/monkeytype) von Miodec und Mitwirkenden,
  Stand v26.32.0 (Commit `d7eb4b76f`), und
- [monkeytype-desktop](https://github.com/sanjayb-28/monkeytype-desktop) von sanjayb-28
  (Commit `efc537b0f`), der Monkeytype ohne Server lauffähig macht.

Wie beide steht pockettype unter der **GPL-3.0** (siehe [LICENSE](LICENSE)).
Name und Logo „Monkeytype“ werden nicht verwendet.

Geändert gegenüber Monkeytype (Stand 03.11.2026):

- kein Monkeytype-Backend, keine Konten, Werbung, Analyse oder Anfragen an fremde Server
- Ergebnisse, Bestwerte und Verlauf im Browser; angemeldet über vibe learning in PocketBase
- Ergebnisbildschirm und Leiste über dem Test auf Deutsch, zusätzlich Anschläge pro Minute
  (QWERTZ, Umschalt/AltGr zählen doppelt)
- Farben wie vibe learning (Nord, hell/dunkel), wenige Einstellungen
- nur Deutsch, Englisch, Französisch, Portugiesisch; drei Schriften; keine Zitate, Challenges, Sounds

## Bauen

Braucht Node 24 und pnpm.

```
pnpm install
pnpm dev-pockettype                                         # Entwicklung, http://localhost:3000/desktop.html
pnpm build-pockettype                                       # Build nach frontend/dist
scripts/pockettype/nach-vibe-learning.sh ../vibe-learning   # bauen und nach vibe-learning/pb_public/tippen/
python3 scripts/pockettype/ausduennen.py                    # Sprachen/Schriften/Dateien ausdünnen (wiederholbar)
```

Eigener Code steht in `frontend/src/ts/pockettype/` (Übersetzung, Anschläge, Farben,
Abgleich mit vibe learning). Änderungen an Monkeytype-Dateien sind mit `pockettype:` kommentiert.
