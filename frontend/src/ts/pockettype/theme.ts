/* theme.ts – Hell/Dunkel wie in vibe learning
 *
 * initTheme()    nach dem Laden der Einstellungen aufrufen. Wählt vibe_light oder vibe_dark:
 *                  1. <html data-theme="dark|light">, wenn schon gesetzt (nav.js/basis.js von vibe learning)
 *                  2. localStorage "wenn-theme" (gemeinsamer Schlüssel von vibe learning)
 *                  3. Systemeinstellung (prefers-color-scheme)
 *                Setzt data-theme auf <html> und folgt Änderungen daran (Knopf in der
 *                Menüleiste von vibe learning), am Speicher (anderer Tab) und am System.
 * toggleTheme()  wechselt hell/dunkel und merkt es sich unter "wenn-theme".
 * isDark()       true, wenn gerade dunkel.
 */
import { createSignal } from "solid-js";

import { setConfig } from "../config/setters";

const SPEICHER = "wenn-theme";
const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");

const [dark, setDark] = createSignal(false);
export const isDark = dark;

function gespeichert(): "dark" | "light" | null {
  try {
    const wert = localStorage.getItem(SPEICHER);
    return wert === "dark" || wert === "light" ? wert : null;
  } catch {
    return null;
  }
}

function anwenden(modus: "dark" | "light"): void {
  setDark(modus === "dark");
  if (root.dataset["theme"] !== modus) root.dataset["theme"] = modus;
  setConfig("autoSwitchTheme", false, { nosave: true });
  setConfig("theme", modus === "dark" ? "vibe_dark" : "vibe_light", {
    nosave: true,
  });
}

export function initTheme(): void {
  const start =
    (root.dataset["theme"] as "dark" | "light" | undefined) ??
    gespeichert() ??
    (media.matches ? "dark" : "light");
  anwenden(start === "dark" ? "dark" : "light");

  new MutationObserver(() => {
    const modus = root.dataset["theme"] === "dark" ? "dark" : "light";
    if ((modus === "dark") !== dark()) anwenden(modus);
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  window.addEventListener("storage", (e) => {
    if (e.key === SPEICHER) anwenden(gespeichert() ?? "light");
  });
  media.addEventListener("change", () => {
    if (gespeichert() === null) anwenden(media.matches ? "dark" : "light");
  });
}

export function toggleTheme(): void {
  const modus = dark() ? "light" : "dark";
  try {
    localStorage.setItem(SPEICHER, modus);
  } catch {
    // ohne Speicher gilt die Wahl nur bis zum Neuladen
  }
  anwenden(modus);
}
