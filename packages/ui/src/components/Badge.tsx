import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ label, variant = 'neutral', dot = false }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      {dot && <View style={[styles.dot, styles[`dot_${variant}`]]} />}
      <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radii.badge,
    gap: spacing.xs,
  },
  label: {
    ...typography.styles.caption,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Variants
  primary: { backgroundColor: '#DBEAFE' },
  secondary: { backgroundColor: '#E0F2FE' },
  success: { backgroundColor: colors.successLight },
  warning: { backgroundColor: colors.warningLight },
  error: { backgroundColor: colors.errorLight },
  info: { backgroundColor: colors.infoLight },
  neutral: { backgroundColor: colors.surfaceAlt },

  label_primary: { color: colors.primaryDark },
  label_secondary: { color: colors.secondaryDark },
  label_success: { color: '#065F46' },
  label_warning: { color: '#92400E' },
  label_error: { color: '#991B1B' },
  label_info: { color: '#0C4A6E' },
  label_neutral: { color: colors.textSecondary },

  dot_primary: { backgroundColor: colors.primary },
  dot_secondary: { backgroundColor: colors.secondary },
  dot_success: { backgroundColor: colors.success },
  dot_warning: { backgroundColor: colors.warning },
  dot_error: { backgroundColor: colors.error },
  dot_info: { backgroundColor: colors.info },
  dot_neutral: { backgroundColor: colors.muted },
});