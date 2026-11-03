import { describe, it, expect } from "vitest";
import { woerterAusText } from "../src/ts/pockettype/aufgabe";

describe("aufgabe", () => {
  it("Zeilenumbruch verlangt Enter, letzte Zeile nicht", () => {
    expect(woerterAusText("Liebe Eltern,\nheute  üben wir.\nGrüße")).toEqual([
      "Liebe",
      "Eltern,\n",
      "heute",
      "üben",
      "wir.\n",
      "Grüße",
    ]);
  });
});
