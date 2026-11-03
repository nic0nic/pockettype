/* lektion-auswahl.ts – Lektion in der Befehlszeile wählen (wie die Sprachauswahl über dem Text)
 *
 * zeigeAuswahl()          öffnet die Liste aller Lektionen; Klick setzt die Lektion (lektionen.ts)
 * zeigeAufgabenAuswahl()  dasselbe für die Tipp-Aufgaben (aufgabe.ts)
 */
import * as Commandline from "../commandline/commandline";
import type { Command } from "../commandline/types";
import { aufgabe, aufgaben, waehleAufgabe } from "./aufgabe";
import {
  alleLektionen,
  lektion,
  lektionsName,
  waehleLektion,
} from "./lektionen";

export function zeigeAuswahl(): void {
  const list: Command[] = alleLektionen().map((l) => ({
    id: `pt-lektion-${l.nr}`,
    display: lektionsName(l.nr),
    active: () => lektion()?.nr === l.nr,
    exec: () => waehleLektion(l.nr),
  }));
  Commandline.show({
    subgroupOverride: { title: "Lektion wählen …", list },
  });
}

export function zeigeAufgabenAuswahl(): void {
  const list: Command[] = aufgaben().map((a) => ({
    id: `pt-aufgabe-${a.id}`,
    display: a.titel,
    active: () => aufgabe()?.id === a.id,
    exec: () => waehleAufgabe(a.id),
  }));
  Commandline.show({
    subgroupOverride: { title: "Aufgabe wählen …", list },
  });
}
