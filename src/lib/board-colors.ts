/** Board color palette — used on home page cards, accent strips, and chat avatars */
export const BOARD_COLORS = [
  { card: "bg-gradient-to-br from-rose-400 to-orange-300", accent: "bg-gradient-to-r from-rose-400 to-orange-300", hex: "#FB7185", hexLight: "#FFF1F2" },
  { card: "bg-gradient-to-br from-violet-500 to-purple-400", accent: "bg-gradient-to-r from-violet-500 to-purple-400", hex: "#8B5CF6", hexLight: "#F5F3FF" },
  { card: "bg-gradient-to-br from-sky-400 to-cyan-300", accent: "bg-gradient-to-r from-sky-400 to-cyan-300", hex: "#38BDF8", hexLight: "#F0F9FF" },
  { card: "bg-gradient-to-br from-emerald-400 to-teal-300", accent: "bg-gradient-to-r from-emerald-400 to-teal-300", hex: "#34D399", hexLight: "#ECFDF5" },
  { card: "bg-gradient-to-br from-amber-400 to-yellow-300", accent: "bg-gradient-to-r from-amber-400 to-yellow-300", hex: "#FBBF24", hexLight: "#FFFBEB" },
  { card: "bg-gradient-to-br from-pink-400 to-rose-300", accent: "bg-gradient-to-r from-pink-400 to-rose-300", hex: "#F472B6", hexLight: "#FDF2F8" },
  { card: "bg-gradient-to-br from-indigo-400 to-blue-300", accent: "bg-gradient-to-r from-indigo-400 to-blue-300", hex: "#818CF8", hexLight: "#EEF2FF" },
  { card: "bg-gradient-to-br from-fuchsia-400 to-pink-300", accent: "bg-gradient-to-r from-fuchsia-400 to-pink-300", hex: "#E879F9", hexLight: "#FDF4FF" },
];

/** Deterministic color from board ID so it's consistent across pages */
export function getBoardColorByIndex(index: number) {
  return BOARD_COLORS[index % BOARD_COLORS.length];
}

export function getBoardColorById(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return BOARD_COLORS[Math.abs(hash) % BOARD_COLORS.length];
}
