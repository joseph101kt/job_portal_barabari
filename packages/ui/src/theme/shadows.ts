import { Platform } from 'react-native';

const shadow = (
  color: string,
  offset: { width: number; height: number },
  opacity: number,
  radius: number,
  elevation: number
) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  });

export const shadows = {
  none: {},

  xs: shadow('#0F172A', { width: 0, height: 1 }, 0.05, 2, 1),
  sm: shadow('#0F172A', { width: 0, height: 2 }, 0.06, 4, 2),
  md: shadow('#0F172A', { width: 0, height: 4 }, 0.08, 8, 4),
  lg: shadow('#0F172A', { width: 0, height: 8 }, 0.1, 16, 8),
  xl: shadow('#0F172A', { width: 0, height: 12 }, 0.12, 24, 12),

  // Colored shadows for primary elements
  primary: shadow('#2563EB', { width: 0, height: 4 }, 0.25, 12, 6),
} as const;