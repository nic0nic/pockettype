/* Deutsche Texte für pockettype.
 *
 * Schlüssel nach Bereich (result.…, xp.…). Platzhalter in geschweiften Klammern,
 * z. B. {n}, werden von t() ersetzt. Fehlt ein Schlüssel, zeigt t() den Schlüssel an.
 */
const de = {
  // Einheiten der Tippgeschwindigkeit (Config.typingSpeedUnit)
  "unit.wpm": "Wörter/min",
  "unit.cpm": "Zeichen/min",
  "unit.wps": "Wörter/s",
  "unit.cps": "Zeichen/s",
  "unit.wph": "Wörter/h",
  "unit.wpm.long": "Wörter pro Minute",
  "unit.cpm.long": "Zeichen pro Minute",
  "unit.wps.long": "Wörter pro Sekunde",
  "unit.cps.long": "Zeichen pro Sekunde",
  "unit.wph.long": "Wörter pro Stunde",

  // Ergebnisbildschirm: Werte
  "result.acc": "Genauigkeit",
  "result.testType": "Testart",
  "result.tags": "Tags",
  "result.editTags": "Tags bearbeiten",
  "result.other": "Sonstiges",
  "result.raw": "roh",
  "result.characters": "Zeichen",
  "result.characters.tooltip": "richtig\nfalsch\nzu viel\nfehlend",
  "result.consistency": "Gleichmäßigkeit",
  "result.time": "Zeit",
  "result.dailyLeaderboard": "Tagesrangliste",
  "result.showDailyLeaderboard": "Tagesrangliste anzeigen",
  "result.source": "Quelle",
  "result.reportQuote": "Zitat melden",
  "result.favoriteQuote": "Zitat merken",
  "result.rateQuote": "Zitat bewerten",
  "result.infinite": "unendlich",
  "result.correctIncorrect": "{correct} richtig\n{incorrect} falsch",
  "result.keyConsistency": "{n} % Tasten",
  "result.afk": "{n} % inaktiv",
  "result.afkTooltip": "{s} s inaktiv ({n} %)",
  "result.timeTooltip": "{t} s ({s} s inaktiv, {n} %)",

  // Anschläge (Großbuchstaben und Sonderzeichen mit Umschalt/AltGr zählen doppelt)
  "result.keystrokes": "Anschläge/min",
  "result.keystrokes.tooltip": "{n} Anschläge in {t} s",

  // Testart
  "mode.time": "Zeit",
  "mode.words": "Wörter",
  "mode.quote": "Zitat",
  "mode.zen": "Zen",
  "mode.custom": "eigener Text",
  "quote.short": "kurz",
  "quote.medium": "mittel",
  "quote.long": "lang",
  "quote.thicc": "sehr lang",
  "testType.punctuation": "Satzzeichen",
  "testType.numbers": "Zahlen",
  "testType.blind": "blind",
  "testType.lazy": "ohne Akzente",
  "testType.expert": "Experte",
  "testType.master": "Meister",
  "testType.stopOnLetter": "Stopp bei falschem Buchstaben",
  "testType.stopOnWord": "Stopp bei falschem Wort",
  "testType.deleteOnError": "Löschen bei Fehler",

  // Lektionen
  "lektion.minuten": "{n} min",
  "lektion.ganz": "ganze Lektion",

  // Leiste über dem Test
  "testConfig.change": "ändern",

  // Sonstiges
  "other.failed": "nicht bestanden ({reason})",
  "other.afkDetected": "Inaktivität erkannt",
  "other.invalid": "ungültig",
  "other.repeated": "wiederholt",
  "other.bailedOut": "abgebrochen",
  "other.tooShort": "zu kurz",

  // Bestwert-Krone
  "pb.line": " Bestwert: {n} ",
  "pb.notEligible": "Dieses Ergebnis zählt nicht als neuer Bestwert ({reason})",
  "pb.couldHave":
    "Das wäre ein neuer Bestwert gewesen (+{n}), aber deine Einstellungen erlauben es nicht ({reason})",
  "pb.mismatch":
    "Gespeicherte Bestwerte passen nicht zusammen, bitte neu laden",
  "pb.reason.funbox": "Funbox",
  "pb.reason.stopOnLetter": "Stopp bei falschem Buchstaben",
  "pb.reason.bailedOut": "abgebrochen",
  "pb.reason.unknown": "unbekannt",

  // Diagramm
  "chart.scale": "Skala",
  "chart.pb": "Bestwert",
  "chart.tagPb": "Tag-Bestwert",
  "chart.raw": "roh",
  "chart.burst": "Wort-Tempo",
  "chart.errors": "Fehler",
  "chart.axis.raw": "Roh-{unit}",
  "chart.axis.burst": "Wort-Tempo ({unit})",
  "chart.axis.errors": "Fehler",

  // Unterer Bereich
  "result.inputHistory": "Eingabeverlauf",
  "result.copyWords": "Wortliste kopieren",
  "result.copyMissedWords": "falsche Wörter kopieren",
  "result.toggleBurstHeatmap": "Tempo-Färbung ein/aus",
  "result.watchReplay": "Wiederholung ansehen",
  "result.startReplay": "Wiederholung starten",
  "result.retrySaving": "Speichern erneut versuchen",
  "result.nextTest": "Nächster Test",
  "result.repeatTest": "Test wiederholen",
  "result.practiseWords": "Falsche Wörter üben",
  "result.toggleWordsHistory": "Eingabeverlauf ein/aus",
  "result.screenshot":
    "Screenshot in die Zwischenablage kopieren\n(Umschalt-Klick zum Herunterladen)",

  // Tippzeit heute/in dieser Sitzung (unter der Zeit)
  "today.today": "heute",
  "today.session": "Sitzung",

  // Sprachnamen (Anzeige, z. B. german_1k → deutsch 1k)
  "language.german": "deutsch",
  "language.english": "englisch",

  // Erfahrungspunkte nach dem Test
  "xp.timeTyping": "Tippzeit",
  "xp.perfect": "fehlerfrei",
  "xp.clean": "sauber korrigiert",
  "xp.quote": "Zitat",
  "xp.punctuation": "Satzzeichen",
  "xp.numbers": "Zahlen",
  "xp.funbox": "Funbox",
  "xp.streak": "Serie",
  "xp.accPenalty": "Abzug Genauigkeit",
  "xp.incomplete": "abgebrochene Tests",
  "xp.daily": "Tagesbonus",
  "xp.configMultiplier": "Faktor gesamt",
} as const;

export default de;
