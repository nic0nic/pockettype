/* lektionen.ts – Übungslektionen aus TIPP10 („Lektion üben“)
 *
 * Aktiv nur auf der Lektionsseite: <html data-pt="lektionen"> (lektionen.html in vibe learning,
 * erzeugt von scripts/pockettype/nach-vibe-learning.sh). Daten: static/lektionen/tipp10-de-qwertz.json
 * (scripts/pockettype/tipp10-lektionen.py, Lizenz GPL-2.0 von TIPP10, eigene Datei).
 *
 * istLektionsSeite()        true auf der Lektionsseite
 * initLektionen()           nach dem Laden der Einstellungen: Daten laden, gewählte Lektion setzen
 * lektion(), dauer()        Signale: aktuelle Lektion {nr, titel, saetze, zeilen} bzw. Dauer in Sekunden (0 = ganze Lektion)
 * waehleLektion(nr)         Lektion setzen, merken und neuen Test starten
 * setzeDauer(s)             Dauer setzen (60, 120, 300, 600 oder 0)
 * alleLektionen()           alle Lektionen (Auswahl in der Befehlszeile: lektion-auswahl.ts, eigene Datei,
 *                           weil die Befehlszeile sonst Kreis-Abhängigkeiten mit test-logic.ts erzeugt)
 * lektionsName(nr)          „Lektion 3 (ri)“
 *
 * Text wie TIPP10 ohne „intelligente“ Auswahl: Einträge in fester Reihenfolge, danach wieder von vorn.
 * Wortlektionen (1–6): Leerzeichen, nach mehr als 35 Zeichen ein Zeilenumbruch (Enter).
 * Satzlektionen (ab 7): nach jedem Satz ein Zeilenumbruch. Standarddauer 5 Minuten wie in TIPP10.
 * Test-Modus und Text werden nur für diese Seite gesetzt (Modus nicht gespeichert).
 */
import { createSignal } from "solid-js";

import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import { showErrorNotification } from "../states/notifications";
import * as CustomText from "../test/custom-text";

export type Lektion = {
  nr: number;
  titel: string;
  saetze: boolean;
  zeilen: string[];
};

const SPEICHER = {
  lektion: "pockettype.lektion",
  dauer: "pockettype.lektionDauer",
};
const ZEICHEN_BIS_UMBRUCH = 35; // TIPP10: NUM_TOKEN_UNTIL_NEW_LINE
export const DAUERN = [60, 120, 300, 600, 0];

const [lektionSignal, setLektionSignal] = createSignal<Lektion | null>(null);
const [dauerSignal, setDauerSignal] = createSignal(300);
export const lektion = lektionSignal;
export const dauer = dauerSignal;
let alle: Lektion[] = [];

export function istLektionsSeite(): boolean {
  return document.documentElement.dataset["pt"] === "lektionen";
}

export function lektionsName(nr: number): string {
  const l = alle.find((x) => x.nr === nr);
  return l ? `Lektion ${l.nr} (${l.titel})` : `Lektion ${nr}`;
}

function lies(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function merke(k: string, v: string): void {
  try {
    localStorage.setItem(k, v);
  } catch {
    // ohne Speicher gilt die Wahl bis zum Neuladen
  }
}

/** Wörter in TIPP10-Reihenfolge; ein "\n" am Wortende verlangt Enter */
export function woerter(l: Lektion): string[] {
  const out: string[] = [];
  let zaehler = 0;
  l.zeilen.forEach((eintrag, i) => {
    let umbruch: boolean;
    if (l.saetze) {
      umbruch = true;
    } else if (i === 0) {
      zaehler = eintrag.length + 1;
      umbruch = false;
    } else {
      zaehler += eintrag.length;
      umbruch = zaehler > ZEICHEN_BIS_UMBRUCH;
      zaehler = umbruch ? 0 : zaehler + 1;
    }
    const teile = eintrag.split(" ").filter((w) => w !== "");
    teile.forEach((w, j) => {
      out.push(umbruch && j === teile.length - 1 ? `${w}\n` : w);
    });
  });
  return out;
}

function anwenden(neuStarten: boolean): void {
  const l = lektionSignal();
  if (!l) return;
  const w = woerter(l);
  const s = dauerSignal();
  CustomText.setText(w);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setLimitMode(s > 0 ? "time" : "word");
  CustomText.setLimitValue(s > 0 ? s : w.length);
  setConfig("mode", "custom", { nosave: true });
  if (neuStarten) restartTestEvent.dispatch();
}

export async function initLektionen(): Promise<void> {
  try {
    const r = await fetch(
      `${import.meta.env.BASE_URL}lektionen/tipp10-de-qwertz.json`,
    );
    alle = ((await r.json()) as { lektionen: Lektion[] }).lektionen;
  } catch (err) {
    showErrorNotification("Lektionen konnten nicht geladen werden", {
      error: err,
    });
    return;
  }
  const nr = Number(lies(SPEICHER.lektion)) || 1;
  const d = Number(lies(SPEICHER.dauer));
  setDauerSignal(DAUERN.includes(d) && lies(SPEICHER.dauer) !== null ? d : 300);
  setLektionSignal(alle.find((x) => x.nr === nr) ?? alle[0] ?? null);
  anwenden(true);
}

export function waehleLektion(nr: number): void {
  const l = alle.find((x) => x.nr === nr);
  if (!l) return;
  merke(SPEICHER.lektion, String(nr));
  setLektionSignal(l);
  anwenden(true);
}

export function setzeDauer(s: number): void {
  merke(SPEICHER.dauer, String(s));
  setDauerSignal(s);
  anwenden(true);
}

export function alleLektionen(): Lektion[] {
  return alle;
}
