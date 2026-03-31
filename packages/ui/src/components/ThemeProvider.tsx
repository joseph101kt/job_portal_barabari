import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, TouchableOpacity, Text } from 'react-native';
import { useColorScheme as useNativeWind } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as baseColors } from './../tokens/colors';

/* ────────────────────────────────────────────────
   Theme Definitions
──────────────────────────────────────────────── */

const lightTheme = {
  colors: {
    ...baseColors,
    background: baseColors.white,
    card: baseColors.surface,
    text: baseColors.text,
    border: baseColors.border,
  },
};

const darkTheme = {
  colors: {
    ...baseColors,
    background: baseColors.dark.bg,
    card: baseColors.dark.surface,
    text: baseColors.dark.text,
    border: baseColors.dark.border,
    muted: baseColors.dark.muted,
  },
};

type ThemeType = 'light' | 'dark';

const STORAGE_KEY = 'APP_THEME';

/* ────────────────────────────────────────────────
   Context
──────────────────────────────────────────────── */

const ThemeContext = createContext<{
  theme: ThemeType;
  colors: typeof lightTheme.colors;
  toggleTheme: () => void;
}>({
  theme: 'light',
  colors: lightTheme.colors,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/* ────────────────────────────────────────────────
   Provider
──────────────────────────────────────────────── */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const { setColorScheme } = useNativeWind();

  const [theme, setTheme] = useState<ThemeType>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  /* ────────────────────────────────────────────────
     Load saved theme
  ──────────────────────────────────────────────── */

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
        } else {
          setTheme(systemTheme === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.log('Failed to load theme');
      } finally {
        setIsLoaded(true);
      }
    }

    loadTheme();
  }, []);

  /* ────────────────────────────────────────────────
     Save theme when changed
  ──────────────────────────────────────────────── */

  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(STORAGE_KEY, theme).catch(() =>
      console.log('Failed to save theme')
    );

    // Sync NativeWind
    setColorScheme(theme);
  }, [theme, isLoaded]);

  /* ────────────────────────────────────────────────
     Toggle
  ──────────────────────────────────────────────── */

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentTheme = useMemo(
    () => (theme === 'light' ? lightTheme : darkTheme),
    [theme]
  );

  /* ────────────────────────────────────────────────
     Prevent flash (important)
  ──────────────────────────────────────────────── */

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: currentTheme.colors,
        toggleTheme,
      }}
    >
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        {children}

        {/* FAB */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: currentTheme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text style={{ fontSize: 20 }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}