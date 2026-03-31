import React, { createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

import { colors } from './../tokens/colors';
import { typography } from './../tokens/typography';
// Custom Toast Styling using your tokens
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.success, backgroundColor: colors.white, height: 60 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={typography.styles.button}
      text2Style={typography.styles.caption}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: colors.error, backgroundColor: colors.white }}
      text1Style={typography.styles.button}
      text2Style={typography.styles.caption}
    />
  ),
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {children}
      {/* Global Toast - Appears at top by default */}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}