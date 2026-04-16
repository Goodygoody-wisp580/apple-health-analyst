function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMOJI_BY_ICON: Record<string, string> = {
  archery: "🏹",
  badminton: "🏸",
  baseball: "⚾",
  basketball: "🏀",
  bowling: "🎳",
  boxing: "🥊",
  cardio: "🤸",
  climbing: "🧗",
  cricket: "🏏",
  cycling: "🚴",
  dance: "💃",
  disc: "🥏",
  equestrian: "🏇",
  football: "🏈",
  generic: "🏅",
  golf: "⛳",
  gymnastics: "🤸",
  handball: "🤾",
  hiking: "🥾",
  hiit: "🔥",
  hockey: "🏒",
  "jump-rope": "🪢",
  lacrosse: "🥍",
  "martial-arts": "🥋",
  "mind-body": "🧘",
  outdoor: "🧭",
  recovery: "🧘",
  rowing: "🚣",
  running: "🏃",
  sailing: "⛵",
  skating: "⛸️",
  skiing: "⛷️",
  soccer: "⚽",
  stairs: "🪜",
  strength: "🏋️",
  surfing: "🏄",
  swimming: "🏊",
  "table-tennis": "🏓",
  tennis: "🎾",
  volleyball: "🏐",
  walking: "🚶",
  "water-polo": "🤽",
  wrestling: "🤼",
};

export function renderTrainingIcon(icon: string): string {
  const emoji = EMOJI_BY_ICON[icon] ?? EMOJI_BY_ICON.generic;

  return `<span aria-hidden="true">${escapeHtml(emoji)}</span>`;
}
