export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,

  // Named aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Layout
  screenPadding: 20,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,
} as const;

export type SpacingKey = keyof typeof spacing;