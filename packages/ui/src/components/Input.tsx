import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required,
  style,
  editable = true,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          hasError && styles.containerError,
          !editable && styles.containerDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {hint && !hasError && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...typography.styles.label,
    color: colors.textSecondary,
  },
  required: {
    ...typography.styles.label,
    color: colors.error,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.input,
    minHeight: 48,
  },
  containerFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.background,
  },
  containerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  containerDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.disabled,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[3],
    ...typography.styles.body,
    color: colors.text,
  },
  inputWithLeft: {
    paddingLeft: spacing.sm,
  },
  inputWithRight: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
  },
  hintText: {
    ...typography.styles.caption,
    color: colors.muted,
  },
});