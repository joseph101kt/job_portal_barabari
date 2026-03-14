import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface DividerProps {
  label?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export function Divider({ label, spacing: spacingProp = 'md' }: DividerProps) {
  if (label) {
    return (
      <View style={[styles.row, styles[spacingProp]]}>
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.divider, styles[spacingProp]]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.styles.caption,
    color: colors.muted,
  },
  sm: { marginVertical: spacing.sm },
  md: { marginVertical: spacing.md },
  lg: { marginVertical: spacing.lg },
});