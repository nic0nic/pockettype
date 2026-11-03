import { Language, LanguageSchema } from "@monkeytype/schemas/languages";

export const LanguageList: Language[] = LanguageSchema._def.values;

export const LanguageGroups: Record<string, Language[]> = {
  german: ["german", "german_1k", "german_10k"],
  english: ["english", "english_1k", "english_5k", "english_10k"],
  french: ["french", "french_1k", "french_2k", "french_10k"],
  portuguese: ["portuguese", "portuguese_1k", "portuguese_3k", "portuguese_5k"],
};

export type LanguageGroupName = keyof typeof LanguageGroups;
export const LanguageGroupNames: LanguageGroupName[] = Array.from(
  Object.keys(LanguageGroups),
);

/**
 * Fetches the language group for a given language.
 * @param language The language code.
 * @returns the language group.
 */
export function getGroupForLanguage(
  language: Language,
): LanguageGroupName | undefined {
  return LanguageGroupNames.find((group) => group.includes(language));
}
