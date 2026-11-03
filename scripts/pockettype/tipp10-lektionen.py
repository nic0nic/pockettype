#!/usr/bin/env python3
"""Übernimmt die Übungslektionen 1–17 (Deutsch, QWERTZ) aus dem Quellcode von TIPP10.

Aufruf im Hauptordner von pockettype:
  python3 scripts/pockettype/tipp10-lektionen.py tipp10_source_v2-1-0.zip

Quelle:  update/sql.tipp10v210.utf im Quellcode-Archiv von TIPP10 2.1.0
         (Tom Thielicke IT Solutions, GNU GPL Version 2)
Ergebnis: frontend/static/lektionen/tipp10-de-qwertz.json  (Inhalt und Reihenfolge wie in TIPP10)
          frontend/static/lektionen/LICENSE-TIPP10.txt     (Lizenz von TIPP10)

Die Lektionen bleiben eine eigene Datendatei unter der Lizenz von TIPP10 (GPL-2.0);
pockettype lädt sie nur zur Laufzeit (pockettype/lektionen.ts).
Lektion 1–6 sind Wortlektionen, ab Lektion 7 Satzlektionen (TIPP10: BORDER_LESSON_IS_SENTENCE = 7).
"""
import json
import re
import sqlite3
import sys
import zipfile
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "frontend/static/lektionen"
LAYOUT = 1          # de_de_qwertz (content_id = Layout · 100000 + Lektion · 1000 + Nr.)
LEKTIONEN = range(1, 18)
SATZ_AB = 7


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    with zipfile.ZipFile(sys.argv[1]) as z:
        def lies(endung: str) -> bytes:
            namen = [n for n in z.namelist() if n.endswith(endung)]
            if len(namen) != 1:
                sys.exit(f"{endung} nicht eindeutig im Archiv: {namen}")
            return z.read(namen[0])
        sql = lies("update/sql.tipp10v210.utf").decode("utf-16")
        lizenz = lies("license_en.txt").decode("utf-8-sig")

    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE lesson_list (lesson_id INTEGER PRIMARY KEY, lesson_name TEXT,"
               " lesson_description TEXT, lesson_code INTEGER, lesson_language TEXT)")
    db.execute("CREATE TABLE lesson_content (content_id INTEGER PRIMARY KEY, content_text TEXT,"
               " content_lesson INTEGER)")
    for zeile in sql.splitlines():
        if re.match(r"INSERT INTO (lesson_list|lesson_content) ", zeile):
            db.execute(zeile.strip().rstrip(";"))

    lektionen = []
    for nr in LEKTIONEN:
        name = db.execute("SELECT lesson_description FROM lesson_list WHERE lesson_id = ? AND lesson_language = 'de_de_qwertz'", (nr,)).fetchone()
        if name is None:
            sys.exit(f"Lektion {nr} fehlt")
        von = LAYOUT * 100000 + nr * 1000
        zeilen = [t for (t,) in db.execute(
            "SELECT content_text FROM lesson_content WHERE content_id > ? AND content_id < ? ORDER BY content_id",
            (von, von + 1000))]
        lektionen.append({"nr": nr, "titel": name[0], "saetze": nr >= SATZ_AB, "zeilen": zeilen})
        print(f"Lektion {nr:2} ({name[0]}): {len(zeilen)} Einträge")

    ZIEL.mkdir(parents=True, exist_ok=True)
    daten = {
        "quelle": "TIPP10 2.1.0, Übungslektionen Deutsch QWERTZ (update/sql.tipp10v210.utf)",
        "urheber": "Tom Thielicke IT Solutions",
        "lizenz": "GNU General Public License Version 2, siehe LICENSE-TIPP10.txt",
        "lektionen": lektionen,
    }
    (ZIEL / "tipp10-de-qwertz.json").write_text(json.dumps(daten, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (ZIEL / "LICENSE-TIPP10.txt").write_text(lizenz, encoding="utf-8")


if __name__ == "__main__":
    main()
