import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, radii, spacing, shadows } from '../theme';

type CardElevation = 'flat' | 'raised' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: boolean;
}

export function Card({
  children,
  elevation = 'raised',
  onPress,
  style,
  padding = true,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[elevation],
    padding && styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.cardPadding,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  raised: {
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadows.sm as object),
  },
  elevated: {
    borderWidth: 0,
    ...(shadows.md as object),
  },
});