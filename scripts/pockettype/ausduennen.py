#!/usr/bin/env python3
"""Dünnt Monkeytype für pockettype aus. Mehrfach ausführbar (idempotent).

Aufruf im Hauptordner des Repos:  python3 scripts/pockettype/ausduennen.py

Behält:
  Sprachen  SPRACHEN (Wortlisten bis 10k Wörter, für Schulen mit QWERTZ)
  Schriften SCHRIFTEN (Standard, gut lesbar, für Legasthenie)
Entfernt:
  übrige Sprachdateien, alle Zitate (Rechte unklar), alle Challenges (Liedtexte u. Ä.),
  alle Sounds, übrige Schriften.
Passt an:
  LanguageSchema (packages/schemas/src/languages.ts) und LanguageGroups
  (frontend/src/ts/constants/languages.ts), KnownFontNameSchema
  (packages/schemas/src/fonts.ts) und Fonts (frontend/src/ts/constants/fonts.ts).

Neue Sprache: in SPRACHEN ergänzen, Datei aus upstream holen
(git checkout upstream/master -- frontend/static/languages/<name>.json), Skript ausführen.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "frontend/static"

# Gruppe -> Wortlisten, in dieser Reihenfolge im Menü
SPRACHEN = {
    "german": ["german", "german_1k", "german_10k"],
    "english": ["english", "english_1k", "english_5k", "english_10k"],
    "french": ["french", "french_1k", "french_2k", "french_10k"],
    "portuguese": ["portuguese", "portuguese_1k", "portuguese_3k", "portuguese_5k"],
}
SCHRIFTEN = ["Roboto_Mono", "Atkinson_Hyperlegible", "Open_Dyslexic"]

ALLE_SPRACHEN = [s for liste in SPRACHEN.values() for s in liste]


def loesche_dateien(ordner: Path, behalten: set[str]) -> int:
    n = 0
    if not ordner.exists():
        return 0
    for f in ordner.iterdir():
        if f.name not in behalten:
            if f.is_dir():
                for g in sorted(f.rglob("*"), reverse=True):
                    g.unlink() if g.is_file() else g.rmdir()
                f.rmdir()
            else:
                f.unlink()
            n += 1
    return n


def ersetze_enum(datei: Path, name: str, werte: list[str]) -> None:
    text = datei.read_text(encoding="utf-8")
    muster = re.compile(
        rf"(export const {name} = z\.enum\(\n  \[\n)(.*?)(\n  \],)", re.S
    )
    if not muster.search(text):
        raise SystemExit(f"{name} nicht gefunden in {datei}")
    liste = "\n".join(f'    "{w}",' for w in werte)
    text = muster.sub(lambda m: m.group(1) + liste + m.group(3), text, count=1)
    datei.write_text(text, encoding="utf-8")


def ersetze_language_groups(datei: Path) -> None:
    text = datei.read_text(encoding="utf-8")
    muster = re.compile(
        r"(export const LanguageGroups: Record<string, Language\[\]> = \{\n)(.*?)(\n\};\n)",
        re.S,
    )
    if not muster.search(text):
        raise SystemExit(f"LanguageGroups nicht gefunden in {datei}")
    zeilen = []
    for gruppe, liste in SPRACHEN.items():
        werte = ", ".join(f'"{w}"' for w in liste)
        zeilen.append(f"  {gruppe}: [{werte}],")
    text = muster.sub(lambda m: m.group(1) + "\n".join(zeilen) + m.group(3), text, count=1)
    datei.write_text(text, encoding="utf-8")


def ersetze_fonts(datei: Path) -> list[str]:
    """Behält in `Fonts` nur SCHRIFTEN, gibt deren Dateinamen zurück."""
    text = datei.read_text(encoding="utf-8")
    start = text.index("export const Fonts: Record<KnownFontName, FontConfig> = {\n")
    kopf_ende = text.index("\n", start) + 1
    ende = text.index("\n};", kopf_ende)
    eintraege = re.findall(r"  (\w+): \{\n(.*?)\n  \},\n", text[kopf_ende : ende + 1] + "\n", re.S)
    behalten = [(n, inhalt) for n, inhalt in eintraege if n in SCHRIFTEN]
    fehlend = set(SCHRIFTEN) - {n for n, _ in behalten}
    if fehlend and not eintraege:
        raise SystemExit("Fonts-Einträge nicht erkannt")
    if fehlend:
        raise SystemExit(f"Schriften fehlen in fonts.ts: {fehlend}")
    behalten.sort(key=lambda e: SCHRIFTEN.index(e[0]))
    neu = "".join(f"  {n}: {{\n{inhalt}\n  }},\n" for n, inhalt in behalten)
    text = text[:kopf_ende] + neu + text[ende + 1 :]
    datei.write_text(text, encoding="utf-8")
    return re.findall(r'fileName: "([^"]+)"', neu)


def main() -> None:
    for s in ALLE_SPRACHEN:
        if not (STATIC / "languages" / f"{s}.json").exists():
            raise SystemExit(f"Sprachdatei fehlt: {s}.json")
        json.loads((STATIC / "languages" / f"{s}.json").read_text(encoding="utf-8"))

    n = loesche_dateien(STATIC / "languages", {f"{s}.json" for s in ALLE_SPRACHEN})
    print(f"Sprachdateien entfernt: {n}")
    for ordner in ("quotes", "challenges", "sounds"):
        n = loesche_dateien(STATIC / ordner, set())
        print(f"{ordner}: {n} entfernt")

    ersetze_enum(ROOT / "packages/schemas/src/languages.ts", "LanguageSchema", ALLE_SPRACHEN)
    ersetze_language_groups(ROOT / "frontend/src/ts/constants/languages.ts")

    ersetze_enum(ROOT / "packages/schemas/src/fonts.ts", "KnownFontNameSchema", SCHRIFTEN)
    dateien = set(ersetze_fonts(ROOT / "frontend/src/ts/constants/fonts.ts"))
    for ordner in ("webfonts", "webfonts-preview"):
        n = loesche_dateien(STATIC / ordner, dateien)
        print(f"{ordner}: {n} entfernt")


if __name__ == "__main__":
    main()
