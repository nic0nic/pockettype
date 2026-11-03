/* vibe.ts – Zusammenspiel mit Menüleiste (nav.js) und Anmeldung (sync.js) von vibe learning
 *
 * Monkeytype fängt jeden Tastendruck für den Test ab. Tastendrücke in der Menüleiste,
 * im Anmeldefenster (.ts-ov) und im Anmeldemenü (.ts-wrap) gehören dort hin:
 *   - sie erreichen die Tastatur-Logik von Monkeytype nicht,
 *   - ist das Anmeldefenster offen, landet die Eingabe immer in dessen Eingabefeld.
 * Wird nur geladen, wenn die Seite in vibe learning läuft (desktop/index.ts).
 */
const FREMD = ".ts-ov, .ts-wrap, .pf-nav";

function anmeldeFeld(): HTMLInputElement | null {
  const ov = document.querySelector(".ts-ov");
  if (!ov) return null;
  return (
    [...ov.querySelectorAll<HTMLInputElement>("input")].find(
      (i) => i.offsetParent !== null,
    ) ?? null
  );
}

function abfangen(e: Event): void {
  const ziel = e.target instanceof Element ? e.target : null;
  const feld = anmeldeFeld();
  if (feld && !ziel?.closest(".ts-ov")) {
    // Fenster offen, Fokus aber im Test: Eingabe ins Anmeldefeld umleiten
    if (e.type === "keydown") feld.focus();
    e.stopImmediatePropagation();
    return;
  }
  if (ziel?.closest(FREMD)) e.stopImmediatePropagation();
}

export function initVibe(): void {
  for (const typ of ["keydown", "keyup", "keypress"]) {
    window.addEventListener(typ, abfangen, true);
  }
  // Monkeytype holt den Fokus zurück in den Test; solange das Fenster offen ist, nicht
  document.addEventListener(
    "focusin",
    (e) => {
      const feld = anmeldeFeld();
      if (feld && e.target instanceof Element && !e.target.closest(".ts-ov")) {
        feld.focus();
      }
    },
    true,
  );
}
