import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  rightAction?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: () => void;
  };
  transparent?: boolean;
  borderless?: boolean;
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  borderless = false,
}: HeaderProps) {
  return (
    <View
      style={[
        styles.wrapper,
        !transparent && styles.background,
        !borderless && !transparent && styles.border,
        !transparent && (shadows.xs as object),
      ]}
    >
      {/* Status bar spacer on iOS */}
      {Platform.OS === 'ios' && <View style={styles.statusBarSpacer} />}

      <View style={styles.container}>
        {/* Left slot */}
        <View style={styles.side}>
          {leftAction && (
            <TouchableOpacity
              onPress={leftAction.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {leftAction.icon}
              {leftAction.label && (
                <Text style={styles.actionLabel}>{leftAction.label}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Center title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right slot */}
        <View style={[styles.side, styles.sideRight]}>
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {rightAction.icon}
              {rightAction.label && (
                <Text style={[styles.actionLabel, styles.actionLabelRight]}>
                  {rightAction.label}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: STATUSBAR_HEIGHT,
  },
  statusBarSpacer: {
    height: 44,
  },
  background: {
    backgroundColor: colors.background,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  side: {
    width: 72,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.h4,
    color: colors.text,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.muted,
    marginTop: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLabel: {
    ...typography.styles.label,
    color: colors.primary,
  },
  actionLabelRight: {
    textAlign: 'right',
  },
});