import * as PageTransition from "../legacy-states/page-transition";
import { navigationEvent, type NavigateOptions } from "../events/navigation";
import * as PageTest from "../pages/test";
import { isFunboxActive } from "../test/funbox/list";
import { showNoticeNotification } from "../states/notifications";
import { getActivePage, setActivePage } from "../states/core";
import {
  isResultCalculating,
  isTestActive,
  isTestRestarting,
} from "../states/test";
import { qsa, qsr } from "../utils/dom";
import * as Misc from "../utils/misc";

type DesktopPath = "/" | "/about" | "/settings" | "/account";

const pages = new Map<DesktopPath, "test" | "about" | "settings" | "account">([
  ["/", "test"],
  ["/about", "about"],
  ["/settings", "settings"],
  ["/account", "account"],
] as const);

const pageSelectors = {
  test: ".pageTest",
  about: "#pageAbout",
  settings: "#pageSettings",
  account: "#pageAccount",
  "404": "#page404",
} as const;

let firstNavigation = true;

async function showPage(page: keyof typeof pageSelectors): Promise<void> {
  const previousPage = getActivePage();
  if (!firstNavigation && previousPage === page) return;

  const duration = Misc.applyReducedMotion(250);
  const previousElement = firstNavigation
    ? null
    : qsr(pageSelectors[previousPage as keyof typeof pageSelectors]);
  const nextElement = qsr(pageSelectors[page]);

  PageTransition.set(true);
  try {
    qsa(".page").removeClass("active");

    if (previousElement !== null) {
      if (previousPage === "test") await PageTest.page.beforeHide?.();
      previousElement.show().setStyle({ opacity: "1" });
      await previousElement.promiseAnimate({
        opacity: "0",
        duration: duration / 2,
      });
      previousElement.hide();
      if (previousPage === "test") await PageTest.page.afterHide?.();
    } else {
      qsa(".page").hide();
    }

    setActivePage(page);
    if (page === "test" && (firstNavigation || previousPage !== "test")) {
      await PageTest.page.beforeShow({});
    }

    nextElement.show().setStyle({ opacity: "0" }).addClass("active");
    await nextElement.promiseAnimate({
      opacity: "1",
      duration: duration / 2,
    });

    if (page === "test") {
      Misc.updateTitle();
    } else {
      const pageTitle =
        page === "404" ? "404" : `${page[0]?.toUpperCase()}${page.slice(1)}`;
      Misc.updateTitle(`${pageTitle} | pockettype`);
    }

    firstNavigation = false;
  } finally {
    PageTransition.set(false);
  }
}

// pockettype: Unterseiten stehen hinter # (z. B. pockettype.html#/settings).
// So läuft die Seite in jedem Unterordner, und Neuladen landet auf derselben Unterseite.
// Links mit href="/settings" (router-link) werden darauf umgesetzt.
function routeOf(target: URL): string {
  if (target.hash.startsWith("#/")) return target.hash.slice(1);
  if (
    target.pathname !== window.location.pathname &&
    pages.has(target.pathname as DesktopPath)
  ) {
    return target.pathname;
  }
  return "/";
}

export async function navigate(
  url = window.location.href,
  options = {} as NavigateOptions,
): Promise<void> {
  if (
    !options.force &&
    (isTestRestarting() || isResultCalculating() || PageTransition.get())
  ) {
    return;
  }
  if (isTestActive() && isFunboxActive("no_quit")) {
    showNoticeNotification(
      "No quit funbox is active. Please finish the test.",
      {
        important: true,
      },
    );
    return;
  }

  const routePath = routeOf(new URL(url, window.location.href));
  const wanted =
    window.location.pathname +
    window.location.search +
    (routePath === "/" ? "" : `#${routePath}`);
  if (
    window.location.pathname + window.location.search + window.location.hash !==
    wanted
  ) {
    history.pushState(null, "", wanted);
  }
  const page = pages.get(routePath as DesktopPath) ?? "404";
  await showPage(page);
}

window.addEventListener(
  "popstate",
  () => void navigate(undefined, { force: true }),
);
window.addEventListener(
  "hashchange",
  () => void navigate(undefined, { force: true }),
);

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener(
    "click",
    (event) => {
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>("a[router-link]");
      if (anchor?.href === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      void navigate(anchor.href);
    },
    { capture: true },
  );
  void navigate(undefined, { force: true }).finally(() => {
    document.body.classList.remove("loading");
  });
});

navigationEvent.subscribe(({ url, options }) => void navigate(url, options));
