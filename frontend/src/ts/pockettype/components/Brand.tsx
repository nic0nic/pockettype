/* Brand.tsx – Schriftzug „pockettype“ im Stil von vibe learning (.pf-brand in nav.js) */
import { JSXElement } from "solid-js";

import { restartTestEvent } from "../../events/test";
import { getActivePage } from "../../states/core";
import { getFocus } from "../../states/test";
import { cn } from "../../utils/cn";

export function Brand(): JSXElement {
  return (
    <a
      href={`${location.origin}${location.pathname}`}
      class={cn(
        "text-[1.5rem] leading-none font-extrabold whitespace-nowrap text-text no-underline transition-colors",
        { "text-sub": getFocus() },
      )}
      style={{
        "font-family":
          'ui-monospace, "Cascadia Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
      }}
      aria-label="pockettype – neuer Test"
      data-ui-element="logo"
      onClick={(e) => {
        e.preventDefault();
        if (getActivePage() === "test") restartTestEvent.dispatch();
      }}
    >
      pocket<span class="text-main">type</span>
    </a>
  );
}
