/* sync.ts – Ergebnisse mit vibe learning (PocketBase) abgleichen
 *
 * Angemeldet ist, wer im localStorage "ts-code" hat (setzt sync.js von vibe learning
 * bei der Anmeldung, löscht es beim Abmelden). Server: pb_hooks/tippen.pb.js.
 * Wem die Daten im Browser gehören, steht unter "pt-besitzer".
 *
 * abgleichBeimStart(speicher)   einmal nach dem Laden der IndexedDB:
 *   nicht angemeldet, Daten gehören jemandem  -> Browser leeren (Abmelden, Wechsel am Schul-PC)
 *   angemeldet, eigene Daten                   -> fehlende Ergebnisse hoch- und herunterladen
 *   angemeldet, Gast-Daten, Konto leer         -> Gast-Ergebnisse ins Konto übernehmen
 *   sonst                                      -> Stand vom Server übernehmen
 * nachSpeichern(ergebnis, daten)  nach jedem Speichern: neues Ergebnis hochladen,
 *                                 Erfahrungspunkte/Serie gesammelt nachschicken
 * loeschenErlaubt()               false, wenn angemeldet (löschen darf nur die Lehrkraft)
 *
 * Ohne Verbindung bleibt alles im Browser; fehlende Ergebnisse gehen beim nächsten Start hoch.
 */
import type { Mode } from "@monkeytype/schemas/shared";

import type { SnapshotResult } from "../constants/default-snapshot";

// Ausschnitt aus DesktopData (desktop/storage.ts), hier nachgebildet,
// weil storage.ts dieses Modul importiert (sonst Kreis-Abhängigkeit)
type DesktopData = {
  results: SnapshotResult<Mode>[];
  xp: number;
  streak: number;
  maxStreak: number;
};

const API = "/api/trainer/tippen";
const K = {
  code: "ts-code",
  besitzer: "pt-besitzer",
  metaStand: "pt-meta-stand",
};

type Ergebnis = SnapshotResult<Mode>;
type Meta = Pick<DesktopData, "xp" | "streak" | "maxStreak">;
type ServerStand = { ergebnisse: Ergebnis[]; meta: Meta | null; stand: number };

export type Speicher<D extends DesktopData = DesktopData> = {
  load: () => D;
  replace: (daten: D) => Promise<void>;
  /** Bestwerte und Tippzeit aus den Ergebnissen neu berechnen */
  rebuild: (daten: D, ergebnisse: Ergebnis[]) => D;
  leer: () => D;
};

const ls = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string): void {
    try {
      localStorage.setItem(k, v);
    } catch {
      // ohne Speicher kein Abgleich
    }
  },
  del(k: string): void {
    try {
      localStorage.removeItem(k);
    } catch {
      // ohne Speicher kein Abgleich
    }
  },
};

class ApiFehler extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const hosted = /^https?:$/.test(location.protocol);

function anmeldung(): string | null {
  return hosted ? ls.get(K.code) : null;
}

async function api<T>(
  pfad: string,
  body?: unknown,
  keepalive = false,
): Promise<T> {
  const r = await fetch(API + pfad, {
    method: body === undefined ? "GET" : "POST",
    keepalive,
    headers: {
      "Content-Type": "application/json",
      "X-Trainer-Code": anmeldung() ?? "",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = (await r.json().catch(() => ({}))) as { message?: string };
  if (!r.ok) throw new ApiFehler(j.message ?? `HTTP ${r.status}`, r.status);
  return j as T;
}

async function hochladen(ergebnisse: Ergebnis[]): Promise<void> {
  for (let i = 0; i < ergebnisse.length; i += 50) {
    await api("/ergebnisse", { ergebnisse: ergebnisse.slice(i, i + 50) });
  }
}

function metaAus(daten: DesktopData): Meta {
  return { xp: daten.xp, streak: daten.streak, maxStreak: daten.maxStreak };
}

async function metaSenden(meta: Meta, keepalive = false): Promise<void> {
  const stand = Date.now();
  try {
    await api("/meta", { meta, stand }, keepalive);
    ls.set(K.metaStand, String(stand));
  } catch (err) {
    // 409: anderes Gerät war neuer, gilt beim nächsten Start
    if (!(err instanceof ApiFehler) || err.status !== 409) throw err;
  }
}

function mitServer<D extends DesktopData>(
  s: Speicher<D>,
  basis: D,
  ergebnisse: Ergebnis[],
  meta: Meta | null,
): D {
  const neu = s.rebuild(basis, ergebnisse);
  return meta ? { ...neu, ...meta } : neu;
}

export async function abgleichBeimStart<D extends DesktopData>(
  s: Speicher<D>,
): Promise<void> {
  const cred = anmeldung();
  const besitzer = ls.get(K.besitzer);

  if (cred === null) {
    if (besitzer !== null) {
      // abgemeldet: Daten der letzten Person nicht im Browser lassen
      await s.replace(s.leer());
      ls.del(K.besitzer);
      ls.del(K.metaStand);
    }
    return;
  }

  let server: ServerStand;
  try {
    server = await api<ServerStand>("");
  } catch (err) {
    // 401: sync.js meldet ab. Ohne Verbindung: eigene Daten behalten, fremde nicht zeigen.
    if (besitzer !== null && besitzer !== cred) {
      await s.replace(s.leer());
      ls.del(K.besitzer);
    }
    console.warn("pockettype: Abgleich nicht möglich", err);
    return;
  }

  const lokal = s.load();
  const serverIds = new Set(server.ergebnisse.map((e) => e._id));
  const serverLeer = server.ergebnisse.length === 0 && server.meta === null;

  if (besitzer === cred) {
    // eigene Daten: in beide Richtungen ergänzen
    await hochladen(lokal.results.filter((e) => !serverIds.has(e._id)));
    const lokalIds = new Set(lokal.results.map((e) => e._id));
    const neu = server.ergebnisse.filter((e) => !lokalIds.has(e._id));
    const lokalStand = Number(ls.get(K.metaStand)) || 0;
    const serverNeuer = server.meta !== null && server.stand > lokalStand;
    if (neu.length > 0 || serverNeuer) {
      const alle = [...lokal.results, ...neu].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      await s.replace(
        mitServer(s, lokal, alle, serverNeuer ? server.meta : null),
      );
      if (serverNeuer) ls.set(K.metaStand, String(server.stand));
    }
    if (!serverNeuer && lokalStand > server.stand) {
      await metaSenden(metaAus(lokal));
    }
  } else if (besitzer === null && serverLeer) {
    // Gast-Ergebnisse in das leere Konto übernehmen
    await hochladen(lokal.results);
    await metaSenden(metaAus(lokal));
  } else {
    // Konto hat schon Daten (oder Browser gehörte jemand anderem): Server gilt
    await s.replace(mitServer(s, s.leer(), server.ergebnisse, server.meta));
    ls.set(K.metaStand, String(server.stand));
  }
  ls.set(K.besitzer, cred);
}

let metaTimer: ReturnType<typeof setTimeout> | undefined;
let metaOffen: Meta | undefined;

export function nachSpeichern(
  ergebnis: Ergebnis | undefined,
  daten: DesktopData,
): void {
  const cred = anmeldung();
  if (cred === null || ls.get(K.besitzer) !== cred) return;
  if (ergebnis !== undefined) {
    hochladen([ergebnis]).catch((err: unknown) =>
      console.warn("pockettype: Ergebnis wird später hochgeladen", err),
    );
  }
  metaOffen = metaAus(daten);
  clearTimeout(metaTimer);
  metaTimer = setTimeout(() => {
    const m = metaOffen;
    metaOffen = undefined;
    if (m) metaSenden(m).catch(() => undefined);
  }, 1500);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "hidden" || metaOffen === undefined) return;
  clearTimeout(metaTimer);
  const m = metaOffen;
  metaOffen = undefined;
  metaSenden(m, true).catch(() => undefined);
});

export function loeschenErlaubt(): boolean {
  return anmeldung() === null;
}
