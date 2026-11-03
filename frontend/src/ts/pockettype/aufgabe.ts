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
 */
import { createSignal } from "solid-js";

import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import * as CustomText from "../test/custom-text";
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

function anwenden(): void {
  const a = aufgabeSignal();
  if (!a) return;
  const w = woerterAusText(a.text);
  CustomText.setText(w);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setLimitMode("word");
  CustomText.setLimitValue(w.length);
  setConfig("mode", "custom", { nosave: true });
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
  anwenden();
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
  anwenden();
}
