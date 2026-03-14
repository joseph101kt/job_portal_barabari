import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  RefreshControl,
} from 'react-native';
import { colors, spacing } from '../theme';

import { Header } from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  // Header config (optional — pass null to skip header)
  header?: React.ComponentProps<typeof Header> | null;
  // Scroll behaviour
  scrollable?: boolean;
  // Pull-to-refresh
  refreshing?: boolean;
  onRefresh?: () => void;
  // Background color override
  backgroundColor?: string;
  // Extra style for the content area
  contentStyle?: StyleProp<ViewStyle>;
  // Avoid keyboard
  avoidKeyboard?: boolean;
  // Floating footer (e.g. CTA button)
  footer?: React.ReactNode;
}

export function PageLayout({
  children,
  header,
  scrollable = true,
  refreshing = false,
  onRefresh,
  backgroundColor,
  contentStyle,
  avoidKeyboard = true,
  footer,
}: PageLayoutProps) {
  const bg = backgroundColor ?? colors.surface;

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentStyle]}>{children}</View>
  );

  const inner = (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {header !== null && header && <Header {...header} />}
      {content}
      {footer && (
        <View style={styles.footer}>{footer}</View>
      )}
    </View>
  );

  if (avoidKeyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {inner}
      </KeyboardAvoidingView>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.sectionGap,
  },
  staticContent: {
    flex: 1,
    padding: spacing.screenPadding,
  },
  footer: {
    padding: spacing.screenPadding,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});