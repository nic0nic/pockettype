import { describe, it, expect } from "vitest";
import { woerter } from "../src/ts/pockettype/lektionen";

describe("lektionen (TIPP10)", () => {
  it("Wortlektion: Zeilenumbruch nach mehr als 35 Zeichen", () => {
    const w = woerter({
      nr: 1,
      titel: "asdf jklö",
      saetze: false,
      zeilen: [
        "asdf jklö",
        "falls",
        "skala",
        "klös",
        "flak",
        "das",
        "als",
        "las",
      ],
    });
    expect(w).toEqual([
      "asdf",
      "jklö",
      "falls",
      "skala",
      "klös",
      "flak",
      "das",
      "als\n",
      "las",
    ]);
  });

  it("Satzlektion: Enter nach jedem Satz", () => {
    const w = woerter({
      nr: 7,
      titel: "gG.:",
      saetze: true,
      zeilen: ["Herr G. sagt.", "Es geht."],
    });
    expect(w).toEqual(["Herr", "G.", "sagt.\n", "Es", "geht.\n"]);
  });
});
