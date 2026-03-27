const CURLY_APOSTROPHE = /\u2019/g;
const NBSP = /\u00a0/g;
const MULTI_SPACE = /\s+/g;

export function canonicalizeSourceName(sourceName: string | undefined | null): string {
  const raw = sourceName ?? "未知来源";
  return raw
    .normalize("NFKC")
    .replace(CURLY_APOSTROPHE, "'")
    .replace(NBSP, " ")
    .replace(MULTI_SPACE, " ")
    .trim()
    .toLowerCase();
}

export function chooseDisplayName(rawNames: Map<string, number>): string {
  return [...rawNames.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0]);
    })[0]?.[0] ?? "未知来源";
}

export function looksWearableSource(sourceName: string): boolean {
  return /(watch|whoop|oura|ring|band|garmin|fitbit|polar|coros)/i.test(sourceName);
}
