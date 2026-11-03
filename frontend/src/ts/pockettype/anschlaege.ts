/* anschlaege.ts – Anschläge zählen wie beim Tastschreiben (deutsche QWERTZ-Tastatur)
 *
 * anschlaegeFuerZeichen(z)  wie viele Tasten für ein Zeichen gedrückt werden:
 *   1  Kleinbuchstaben, ä ö ü ß, Ziffern, Leerzeichen, , . - + # <
 *   2  Großbuchstaben und alles mit Umschalt (! " § $ % & / ( ) = ? * ' > ; : _ °),
 *      alles mit AltGr (@ € { } [ ] \ ~ | ² ³ µ),
 *      Akzente mit Tottaste (é á ê â … = Tottaste + Buchstabe, ^ und ´ = Tottaste + Leertaste)
 *   3  Akzente mit Umschalt-Tottaste (è à ù …, ` = Umschalt + Tottaste + Leertaste),
 *      großer Buchstabe mit Akzent (É Ê …)
 * anschlaegeFuerText(s)     Summe für einen Text
 *
 * Gezählt werden in countChars() (utils/strings.ts) nur die Zeichen, die auch für die
 * Wörter pro Minute zählen: richtig getippte Wörter, also nur die richtigen Zeichen.
 */

const umschalt = new Set([..."°!\"§$%&/()=?*'>;:_"]);
const altGr = new Set([..."@€{}[]\\~|²³µ"]);
const totTaste = new Set([..."^´"]);
const totTasteUmschalt = new Set([..."`"]);
// Akzent mit ´ oder ^ (Tottaste ohne Umschalt) bzw. mit ` (Tottaste mit Umschalt)
const akzent = new Set([..."áéíóúýâêîôû"]);
const akzentUmschalt = new Set([..."àèìòù"]);

export function anschlaegeFuerZeichen(zeichen: string): number {
  if (umschalt.has(zeichen) || altGr.has(zeichen) || totTaste.has(zeichen)) {
    return 2;
  }
  if (totTasteUmschalt.has(zeichen)) return 3;

  const klein = zeichen.toLowerCase();
  const gross = klein !== zeichen; // Großbuchstabe (auch Ä Ö Ü)
  let n = 1;
  if (akzent.has(klein)) n = 2;
  else if (akzentUmschalt.has(klein)) n = 3;
  return gross ? n + 1 : n;
}

export function anschlaegeFuerText(text: string): number {
  let summe = 0;
  for (const zeichen of text) summe += anschlaegeFuerZeichen(zeichen);
  return summe;
}
