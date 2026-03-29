// packages/ui/src/tokens/colors.ts
// Raw color values — use these for inline styles and StyleSheet
// For NativeWind use the tailwind config classes

export const colors = {
  // Primary — indigo blue
  primary:      '#4F6EF7',
  primaryLight: '#EEF2FF',
  primaryDark:  '#3730A3',

  // Secondary — warm orange
  secondary:    '#F97316',
  secondaryLight:'#FFF7ED',

  // Semantic
  success:      '#22C55E',
  successLight: '#F0FDF4',
  warning:      '#EAB308',
  warningLight: '#FEFCE8',
  error:        '#EF4444',
  errorLight:   '#FEF2F2',

  // Neutral scale
  white:        '#FFFFFF',
  surface:      '#F8FAFC',
  surfaceAlt:   '#F1F5F9',
  border:       '#E2E8F0',
  borderDark:   '#CBD5E1',
  muted:        '#64748B',
  text:         '#0F172A',
  textSecondary:'#475569',

  // Dark mode surfaces
  dark: {
    bg:       '#0F172A',
    surface:  '#1E293B',
    border:   '#334155',
    text:     '#F8FAFC',
    muted:    '#94A3B8',
  },
}

// Application status colors
export const statusColors = {
  applied: {
    bg:   '#EFF6FF',
    text: '#1D4ED8',
    dot:  '#3B82F6',
  },
  shortlisted: {
    bg:   '#FEFCE8',
    text: '#A16207',
    dot:  '#EAB308',
  },
  rejected: {
    bg:   '#FEF2F2',
    text: '#B91C1C',
    dot:  '#EF4444',
  },
  hired: {
    bg:   '#F0FDF4',
    text: '#15803D',
    dot:  '#22C55E',
  },
}

export const employmentTypeColors: Record<string, { bg: string; text: string }> = {
  internship: { bg: '#F3E8FF', text: '#7C3AED' },
  full_time:  { bg: '#EFF6FF', text: '#1D4ED8' },
  part_time:  { bg: '#ECFDF5', text: '#047857' },
  contract:   { bg: '#FFF7ED', text: '#C2410C' },
}