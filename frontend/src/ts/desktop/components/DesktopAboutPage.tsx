import type { JSXElement } from "solid-js";

import { H2, H3 } from "../../components/common/Headers";
import { Page } from "../../components/common/Page";
import { CommandlineHotkey } from "../../components/hotkeys/CommandlineHotkey";
import { QuickRestartHotkey } from "../../components/hotkeys/QuickRestartHotkey";

// pockettype: Info-Seite
export function DesktopAboutPage(): JSXElement {
  return (
    <Page id="about">
      <div class="content-grid grid gap-8">
        <section class="text-center text-sub">
          pockettype – Tipptrainer für den Unterricht
        </section>
        <section>
          <H2 fa={{ icon: "fa-info-circle" }} text="über pockettype" />
          <p>
            pockettype ist ein Tipptrainer für die Schule. Gemessen werden
            Wörter und Anschläge pro Minute, Genauigkeit und Gleichmäßigkeit.
            Ergebnisse, Bestwerte und Verlauf werden in diesem Browser
            gespeichert. Es gibt keine Werbung und keine Verbindung zu fremden
            Servern.
          </p>
        </section>
        <section>
          <H3 fa={{ icon: "fa-keyboard" }} text="Tastenkürzel" />
          <p>
            Mit <QuickRestartHotkey /> startest du einen neuen Test. Mit{" "}
            <CommandlineHotkey /> öffnest du die Befehlszeile für Modi und
            Einstellungen.
          </p>
        </section>
        <section>
          <H3 fa={{ icon: "fa-code" }} text="Quellcode und Lizenz" />
          <p>
            pockettype basiert auf{" "}
            <a
              href="https://github.com/monkeytypegame/monkeytype"
              target="_blank"
              rel="noreferrer noopener"
            >
              Monkeytype
            </a>{" "}
            von Miodec und Mitwirkenden und auf{" "}
            <a
              href="https://github.com/sanjayb-28/monkeytype-desktop"
              target="_blank"
              rel="noreferrer noopener"
            >
              monkeytype-desktop
            </a>
            . Wie diese steht pockettype unter der GPL-3.0. Der Quellcode liegt
            auf{" "}
            <a
              href="https://github.com/nic0nic/pockettype"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </Page>
  );
}
