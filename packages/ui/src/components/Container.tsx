import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { spacing } from '../theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // Remove horizontal padding (e.g. for full-bleed sections)
  noHorizontalPadding?: boolean;
  // Center content horizontally
  centered?: boolean;
  // Row layout
  row?: boolean;
  // Gap between children
  gap?: keyof typeof spacing;
}

export function Container({
  children,
  style,
  noHorizontalPadding = false,
  centered = false,
  row = false,
  gap,
}: ContainerProps) {
  return (
    <View
      style={[
        styles.base,
        !noHorizontalPadding && styles.horizontalPadding,
        centered && styles.centered,
        row && styles.row,
        gap !== undefined && { gap: spacing[gap] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  horizontalPadding: {
    paddingHorizontal: spacing.screenPadding,
  },
  centered: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});