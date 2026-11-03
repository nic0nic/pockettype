import { describe, it, expect } from "vitest";
import {
  anschlaegeFuerZeichen,
  anschlaegeFuerText,
} from "../src/ts/pockettype/anschlaege";

describe("anschlaege", () => {
  it.each([
    ["a", 1],
    ["ä", 1],
    ["ß", 1],
    ["7", 1],
    [" ", 1],
    [",", 1],
    ["A", 2],
    ["Ü", 2],
    ["!", 2],
    ["?", 2],
    ["@", 2],
    ["€", 2],
    ["é", 2],
    ["è", 3],
    ["É", 3],
    ["`", 3],
  ])("%s → %i", (zeichen, erwartet) => {
    expect(anschlaegeFuerZeichen(zeichen)).toBe(erwartet);
  });

  it("summiert einen Text", () => {
    expect(anschlaegeFuerText("Hallo Welt!")).toBe(14);
  });
});
