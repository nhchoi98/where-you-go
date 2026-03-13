/** Canvas-safe color constants for game components (SpinWheel, LadderGame, etc.) */
export const palette = {
  primary: '#E84057',
  primaryLight: '#F06070',
  rose: '#FF6B6B',
  roseMedium: '#FF8E8E',
  roseLight: '#FFB4B4',
  pinkBorder: '#FFE0E0',
  warmBg: '#FFF5EE',
  pageBg: '#FFFAF5',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  white: '#FFFFFF',
} as const

/** Spin wheel slice colors — warm palette, enough contrast for readability */
export const wheelColors = [
  '#E84057',
  '#FF6B6B',
  '#FF8E8E',
  '#FFB4B4',
  '#FFE0E0',
  '#FFF0F0',
] as const

/** Ladder game line colors */
export const ladderColors = {
  vertical: '#FFE0E0',
  bridge: '#FF8E8E',
  playerText: '#E84057',
  itemText: '#1A1A2E',
  resultBg: '#FFF5EE',
} as const
