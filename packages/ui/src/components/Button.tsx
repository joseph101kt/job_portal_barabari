import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, radii, spacing, shadows } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        variant === 'primary' && !isDisabled && shadows.primary,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}`],
              styles[`labelSize_${size}`],
              isDisabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 0,
  },
  ghost: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
    borderWidth: 0,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    ...(shadows.none as object),
  },

  // Sizes
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing[3],
    minHeight: 48,
  },
  size_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 56,
  },

  // Label base
  label: {
    ...typography.styles.button,
  },
  label_primary: {
    color: colors.white,
  },
  label_secondary: {
    color: colors.white,
  },
  label_ghost: {
    color: colors.primary,
  },
  label_outline: {
    color: colors.primary,
  },
  label_danger: {
    color: colors.white,
  },
  labelDisabled: {
    color: colors.disabledText,
  },

  // Label sizes
  labelSize_sm: {
    ...typography.styles.buttonSm,
  },
  labelSize_md: {
    ...typography.styles.button,
  },
  labelSize_lg: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
});