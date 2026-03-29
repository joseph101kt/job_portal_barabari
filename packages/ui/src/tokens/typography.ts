// packages/ui/src/tokens/typography.ts

export const typography = {
  // Font sizes
  size: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },

  // Font weights (as string for RN)
  weight: {
    normal:    '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
  },

  // Line heights
  leading: {
    tight:  1.25,
    snug:   1.375,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Semantic text styles (for StyleSheet usage)
  styles: {
    display:   { fontSize: 34, fontWeight: '700' as const, lineHeight: 40 },
    h1:        { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
    h2:        { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
    h3:        { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    h4:        { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
    body:      { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption:   { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
    label:     { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    button:    { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  },
}