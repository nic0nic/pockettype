/* lektion-auswahl.ts – Lektion in der Befehlszeile wählen (wie die Sprachauswahl über dem Text)
 *
 * zeigeAuswahl()   öffnet die Liste aller Lektionen; Klick setzt die Lektion (lektionen.ts)
 */
import * as Commandline from "../commandline/commandline";
import type { Command } from "../commandline/types";
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
