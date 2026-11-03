/* aufgabe.ts – Tipp-Aufgabe der Lehrkraft abschreiben („Aufgabe“ unter Tippen)
 *
 * Aktiv nur auf der Aufgabenseite: <html data-pt="aufgabe"> (aufgabe.html in vibe learning).
 * Aufgaben kommen vom Server (sync.ts meineAufgaben, pb_hooks/tippen.pb.js).
 *
 * istAufgabenSeite()       true auf der Aufgabenseite
 * initAufgaben()           nach dem Laden der Einstellungen: Aufgaben holen, gewählte setzen
 * aufgabe(), aufgaben()    Signale: aktuelle Aufgabe bzw. alle aktiven Aufgaben
 * zustand()                "laden" | "gast" (nicht angemeldet) | "keine" | "ok"
 * waehleAufgabe(id)        Aufgabe setzen, merken und neuen Test starten
 * woerterAusText(text)     Wörter; ein Zeilenumbruch im Text verlangt Enter
 *
 * Der Text wird einmal komplett abgeschrieben (Modus „eigener Text“, Grenze = alle Wörter),
 * beliebig oft wiederholbar. Das Ergebnis merkt die Aufgabe (test-logic.ts, Feld aufgabe).
 *
 * Fortschritt: nach jedem Wort unter localStorage "tippaufgabe-stand" (sync.js speichert ihn
 * auf dem Server, Tool-id tippaufgabe). Wer die Seite verlässt oder neu lädt, macht am
 * nächsten Wort weiter; die Teile werden beim Abschluss zu einem Ergebnis zusammengefasst.
 *   vorTest()                  in test-logic init(): Text ab dem gespeicherten Wort setzen
 *   abschliessen(ce, log)      in buildCompletedEvent: Teile einrechnen, Stand löschen
 *   neustartGesperrt()         true während eines Durchgangs (test-logic restart())
 *   fortschritt()              Signal {wort, gesamt} für den Hinweis über dem Text
 */
import { createEffect, createSignal } from "solid-js";

import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import {
  getActiveWordIndex,
  isTestActive,
  isTestRestarting,
} from "../states/test";
import * as CustomText from "../test/custom-text";
import { buildEventLog } from "../test/events/data";
import { getAccuracy, getChars } from "../test/events/stats";
import type { EventLog } from "../test/events/types";
import { roundTo2 } from "@monkeytype/util/numbers";

import { calculateWpm } from "../utils/numbers";
import { meineAufgaben, type TippAufgabe } from "./sync";

const SPEICHER = "pockettype.aufgabe";
const [aufgabeSignal, setAufgabe] = createSignal<TippAufgabe | null>(null);
const [aufgabenSignal, setAufgaben] = createSignal<TippAufgabe[]>([]);
const [zustandSignal, setZustand] = createSignal<
  "laden" | "gast" | "keine" | "ok"
>("laden");
export const aufgabe = aufgabeSignal;
export const aufgaben = aufgabenSignal;
export const zustand = zustandSignal;

export function istAufgabenSeite(): boolean {
  return document.documentElement.dataset["pt"] === "aufgabe";
}

export function woerterAusText(text: string): string[] {
  const zeilen = text
    .split("\n")
    .map((z) => z.split(/\s+/).filter((w) => w !== ""));
  const out: string[] = [];
  zeilen.forEach((w, i) => {
    w.forEach((wort, j) => {
      out.push(
        j === w.length - 1 && i < zeilen.length - 1 ? `${wort}\n` : wort,
      );
    });
  });
  return out;
}

/* ---------- Fortschritt nach jedem Wort ---------- */
type Teil = {
  ms: number;
  correctWord: number;
  allCorrect: number;
  incorrect: number;
  extra: number;
  missed: number;
  anschlaege: number;
  accOk: number;
  accFalsch: number;
};
type StandEintrag = {
  wort: number;
  teile: Teil[];
  aktuell?: Teil & { wort: number };
};
const STAND = "tippaufgabe-stand";
const [fortschrittSignal, setFortschritt] = createSignal<{
  wort: number;
  gesamt: number;
} | null>(null);
export const fortschritt = fortschrittSignal;
let startWort = 0; // erstes Wort des laufenden Tests
let vorbereitet = ""; // Aufgabe, für die init() den Text schon gesetzt hat

function leseStand(): Record<string, StandEintrag> {
  try {
    return JSON.parse(localStorage.getItem(STAND) ?? "{}") as Record<
      string,
      StandEintrag
    >;
  } catch {
    return {};
  }
}
function schreibeStand(st: Record<string, StandEintrag>): void {
  try {
    localStorage.setItem(STAND, JSON.stringify(st));
  } catch {
    return;
  }
  (window as { TrainerSync?: { changed: () => void } }).TrainerSync?.changed();
}

// Teil aus der laufenden Eingabe: nur fertige Wörter (aufgerufen direkt nach dem Wortwechsel)
function teilJetzt(): Teil {
  const log = buildEventLog();
  const c = getChars(log);
  const acc = getAccuracy(log);
  const ms = log.events.reduce((m, e) => Math.max(m, e.testMs), 0);
  return {
    ms,
    correctWord: c.correctWord,
    allCorrect: c.allCorrect,
    incorrect: c.incorrect,
    extra: c.extra,
    missed: c.missed,
    anschlaege: c.anschlaege,
    accOk: acc.correct,
    accFalsch: acc.incorrect,
  };
}

createEffect(() => {
  const i = getActiveWordIndex();
  if (!istAufgabenSeite() || !isTestActive() || i === 0) return;
  const a = aufgabeSignal();
  if (!a) return;
  const st = leseStand();
  const e = st[a.id] ?? { wort: startWort, teile: [] };
  e.aktuell = { ...teilJetzt(), wort: startWort + i };
  st[a.id] = e;
  schreibeStand(st);
  setFortschritt({
    wort: startWort + i,
    gesamt: woerterAusText(a.text).length,
  });
});

/** in test-logic init(): Text ab dem gespeicherten Wort, offenen Teil abschließen */
export function vorTest(): void {
  const a = aufgabeSignal();
  if (!istAufgabenSeite() || !a) return;
  const st = leseStand();
  const e = st[a.id];
  if (e?.aktuell) {
    const { wort, ...teil } = e.aktuell;
    e.teile.push(teil);
    e.wort = wort;
    delete e.aktuell;
    schreibeStand(st);
  }
  const w = woerterAusText(a.text);
  startWort = e && e.wort < w.length ? e.wort : 0;
  const rest = w.slice(startWort);
  CustomText.setText(rest);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setLimitMode("word");
  CustomText.setLimitValue(rest.length);
  setFortschritt(startWort > 0 ? { wort: startWort, gesamt: w.length } : null);
  vorbereitet = a.id;
}

type Ergebnis = {
  testDuration: number;
  charStats: [number, number, number, number];
  charTotal: number;
  anschlaege?: number;
  acc: number;
  wpm: number;
  rawWpm: number;
};

/** in buildCompletedEvent: frühere Teile einrechnen, danach Stand dieser Aufgabe löschen */
export function abschliessen(ce: Ergebnis, log: EventLog): void {
  const a = aufgabeSignal();
  if (!istAufgabenSeite() || !a) return;
  const st = leseStand();
  const teile = st[a.id]?.teile ?? [];
  schreibeStand(
    Object.fromEntries(Object.entries(st).filter(([id]) => id !== a.id)),
  );
  setFortschritt(null);
  setFertig(true);
  if (!teile.length) return;
  const sum = (f: (t: Teil) => number): number =>
    teile.reduce((n, t) => n + f(t), 0);
  const acc = getAccuracy(log);
  const dauer = ce.testDuration + sum((t) => t.ms) / 1000;
  const correctWord = ce.charStats[0] + sum((t) => t.correctWord);
  const incorrect = ce.charStats[1] + sum((t) => t.incorrect);
  const extra = ce.charStats[2] + sum((t) => t.extra);
  const missed = ce.charStats[3] + sum((t) => t.missed);
  const allCorrect =
    ce.charTotal - ce.charStats[1] - ce.charStats[2] + sum((t) => t.allCorrect);
  const ok = acc.correct + sum((t) => t.accOk);
  const falsch = acc.incorrect + sum((t) => t.accFalsch);
  ce.testDuration = roundTo2(dauer);
  ce.charStats = [correctWord, incorrect, extra, missed];
  ce.charTotal = allCorrect + incorrect + extra;
  ce.anschlaege = (ce.anschlaege ?? 0) + sum((t) => t.anschlaege);
  ce.acc = ok + falsch > 0 ? roundTo2((ok / (ok + falsch)) * 100) : ce.acc;
  ce.wpm = roundTo2(calculateWpm(correctWord, dauer));
  ce.rawWpm = roundTo2(calculateWpm(allCorrect + incorrect + extra, dauer));
}

/** Neustart während eines Durchgangs gesperrt; neu beginnen erst nach dem vollständigen Text */
export function neustartGesperrt(): boolean {
  return istAufgabenSeite() && isTestActive();
}

const [fertigSignal, setFertig] = createSignal(false);
/** true nach einem vollständigen Durchgang (Ergebnisbildschirm: Verbesserungsversuch) */
export const fertig = fertigSignal;

async function anwenden(): Promise<void> {
  const a = aufgabeSignal();
  if (!a) return;
  setConfig("mode", "custom", { nosave: true });
  setFertig(false);
  // Läuft der erste Test-Start noch, nicht dazwischen neu starten (sonst fehlt das aktive Wort)
  for (let i = 0; i < 100 && isTestRestarting(); i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (vorbereitet === a.id) return; // init() hat diese Aufgabe schon gesetzt
  restartTestEvent.dispatch(); // init() ruft vorTest()
}

/** nach einem Durchgang: neuen Durchgang von vorn */
export function verbesserungsversuch(): void {
  setFertig(false);
  restartTestEvent.dispatch();
}

// Ohne Aufgabe: Test ausblenden (desktop.scss, html[data-pt-leer]) und Hinweis zeigen
function hinweis(text: string): void {
  document.documentElement.dataset["ptLeer"] = "";
  const div = document.createElement("div");
  div.className = "ptHinweis";
  div.textContent = text;
  document.querySelector(".pageTest")?.prepend(div);
}

export async function initAufgaben(): Promise<void> {
  // Tab würde den Fokus aus dem Text nehmen (und mit Enter neu starten): hier ohne Wirkung
  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "Tab" &&
        !(e.target instanceof Element && e.target.closest(".ts-ov"))
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("#ptVerbessernBtn")) {
      verbesserungsversuch();
    }
  });
  const liste = await meineAufgaben();
  if (liste === null) {
    setZustand("gast");
    hinweis(
      "Melde dich oben rechts an, um die Aufgaben deiner Klasse zu sehen.",
    );
    return;
  }
  setAufgaben(liste);
  if (!liste.length) {
    setZustand("keine");
    hinweis(
      "Zurzeit hat deine Lehrkraft keine Aufgabe zum Abschreiben aufgegeben.",
    );
    return;
  }
  let gemerkt: string | null = null;
  try {
    gemerkt = localStorage.getItem(SPEICHER);
  } catch {
    // ohne Speicher die neueste Aufgabe
  }
  setAufgabe(liste.find((a) => a.id === gemerkt) ?? liste[0] ?? null);
  setZustand("ok");
  await anwenden();
}

export function waehleAufgabe(id: string): void {
  const a = aufgabenSignal().find((x) => x.id === id);
  if (!a) return;
  try {
    localStorage.setItem(SPEICHER, id);
  } catch {
    // gilt bis zum Neuladen
  }
  setAufgabe(a);
  vorbereitet = "";
  void anwenden();
}
