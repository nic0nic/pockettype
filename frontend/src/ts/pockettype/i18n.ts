/* i18n.ts – Übersetzungen für pockettype
 *
 * t(key, params?)        Text zum Schlüssel aus locales/de.ts, Platzhalter {name} werden ersetzt.
 *                        t("result.correctIncorrect", {correct: 5, incorrect: 1})
 * translateDom(root)     übersetzt im HTML alle Elemente unterhalb von root:
 *                          data-i18n="key"       ersetzt den Text des Elements
 *                          data-i18n-aria="key"  ersetzt das Attribut aria-label (Tooltip)
 *                        Im HTML bleibt der englische Text als Rückfall stehen.
 * unitShort(unit), unitLong(unit)   Einheit der Tippgeschwindigkeit (wpm, cpm …)
 * xpLabel(label)         englische Bezeichnung der Erfahrungspunkte → deutsch
 * languageName(lang)     Sprachname für die Anzeige: german_1k → deutsch_1k (andere unverändert)
 *
 * Weitere Sprachen: eine Datei in locales/ mit denselben Schlüsseln anlegen und hier wählen.
 */
import de from "./locales/de";

export type I18nKey = keyof typeof de;
const texts: Record<string, string> = de;

export function t(
  key: I18nKey,
  params?: Record<string, string | number>,
): string {
  let text = texts[key] ?? key;
  if (params !== undefined) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function translateDom(root: ParentNode | null | undefined): void {
  if (!root) return;
  for (const el of root.querySelectorAll<HTMLElement>("[data-i18n]")) {
    el.textContent = t(el.dataset["i18n"] as I18nKey);
  }
  for (const el of root.querySelectorAll<HTMLElement>("[data-i18n-aria]")) {
    el.setAttribute("aria-label", t(el.dataset["i18nAria"] as I18nKey));
  }
}

export function unitShort(unit: string): string {
  return t(`unit.${unit}` as I18nKey);
}

export function unitLong(unit: string): string {
  return t(`unit.${unit}.long` as I18nKey);
}

export function languageName(language: string): string {
  const [base = "", ...rest] = language.split("_");
  const key = `language.${base}`;
  if (texts[key] === undefined) return language;
  return [texts[key], ...rest].join("_");
}

const xpLabels: Record<string, I18nKey> = {
  "time typing": "xp.timeTyping",
  perfect: "xp.perfect",
  clean: "xp.clean",
  quote: "xp.quote",
  punctuation: "xp.punctuation",
  numbers: "xp.numbers",
  funbox: "xp.funbox",
  streak: "xp.streak",
  "accuracy penalty": "xp.accPenalty",
  "incomplete tests": "xp.incomplete",
  "global multiplier": "xp.configMultiplier",
  "daily bonus": "xp.daily",
};

export function xpLabel(label: string): string {
  const key = xpLabels[label];
  return key === undefined ? label : t(key);
}
