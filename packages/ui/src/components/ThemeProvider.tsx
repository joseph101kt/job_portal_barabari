import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, TouchableOpacity, Text, View } from 'react-native';
import { useColorScheme as useNativeWind } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native'

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

      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}


export function ThemeToggle({
  variant = 'button',
}: {
  variant?: 'button' | 'row'
}) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'row') {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
        }}
      >
        {/* 👇 Only THIS is touchable */}
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
          <Text
            style={{
              fontSize: 16,
              marginRight: 12,
              color: isDark ? '#fff' : '#000',
            }}
          >
            Dark Mode
          </Text>
        </TouchableOpacity>

        {/* 👇 Switch is independent */}
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#ccc', true: '#4f46e5' }}
          thumbColor="#fff"
        />
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
      }}
    >
      <Text
        style={{
          textAlign: 'center',
          fontSize: 14,
          color: isDark ? '#fff' : '#000',
        }}
      >
        {isDark
          ? 'Switch to Light Mode ☀️'
          : 'Switch to Dark Mode 🌙'}
      </Text>
    </TouchableOpacity>
  )
}