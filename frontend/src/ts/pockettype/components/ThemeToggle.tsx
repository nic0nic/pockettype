/* ThemeToggle.tsx – Knopf Hell/Dunkel (wie #pfTheme in nav.js von vibe learning).
 * In vibe learning (katalog.js geladen) hat die Menüleiste schon einen Knopf, dann keiner hier. */
import { JSXElement, Show } from "solid-js";

import { isDark, toggleTheme } from "../theme";

export function ThemeToggle(): JSXElement {
  return (
    <Show when={!("KATALOG" in window)}>
      <button
        type="button"
        class="textButton"
        aria-label="Hell/Dunkel umschalten"
        data-balloon-pos="left"
        onClick={() => toggleTheme()}
      >
        <i class={isDark() ? "fas fa-fw fa-sun" : "fas fa-fw fa-moon"}></i>
        <div class="text">{isDark() ? "hell" : "dunkel"}</div>
      </button>
    </Show>
  );
}
