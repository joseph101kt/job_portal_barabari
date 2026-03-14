export const colors = {
  // Brand
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#0EA5E9',
  secondaryLight: '#38BDF8',
  secondaryDark: '#0284C7',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',
  overlay: 'rgba(15, 23, 42, 0.4)',

  // Text
  text: '#0F172A',
  textSecondary: '#334155',
  muted: '#64748B',
  placeholder: '#94A3B8',

  // Borders
  border: '#E2E8F0',
  borderFocus: '#2563EB',
  divider: '#F1F5F9',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Disabled
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
} as const;

export type ColorKey = keyof typeof colors;