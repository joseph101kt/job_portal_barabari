export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,

  // Component-specific
  button: 10,
  input: 10,
  card: 14,
  badge: 6,
  chip: 20,
  modal: 20,
  avatar: 9999,
} as const;

export type RadiiKey = keyof typeof radii;