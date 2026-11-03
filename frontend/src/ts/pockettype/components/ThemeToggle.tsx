/* ThemeToggle.tsx – Knopf Hell/Dunkel (wie #pfTheme in nav.js von vibe learning) */
import { JSXElement } from "solid-js";

import { isDark, toggleTheme } from "../theme";

export function ThemeToggle(): JSXElement {
  return (
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
  );
}
