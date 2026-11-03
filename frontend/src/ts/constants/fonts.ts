import { KnownFontName } from "@monkeytype/schemas/fonts";

export type FontConfig = {
  display?: string;
  weight?: number;
} & (
  | {
      systemFont: true;
      fileName?: never;
    }
  | {
      systemFont?: never;
      fileName: string;
    }
);

export const Fonts: Record<KnownFontName, FontConfig> = {
  Roboto_Mono: {
    fileName: "RobotoMono-Regular.woff2",
  },
  Atkinson_Hyperlegible: {
    fileName: "AtkinsonHyperlegible-Regular.woff2",
  },
  Open_Dyslexic: {
    fileName: "OpenDyslexic-Regular.woff2",
  },
};
