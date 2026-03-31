// packages/ui/src/components/ToastProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import { typography } from './../tokens/typography';
import { useTheme } from './ThemeProvider';

/* ──────────────────────────────────────────────── */

type ToastType = 'success' | 'error';

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

/* ────────────────────────────────────────────────
   GLOBAL API
──────────────────────────────────────────────── */

let toastRef: {
  show: (type: ToastType, title: string, message?: string) => void;
} | null = null;

export const Toast = {
  show: (type: ToastType, title: string, message?: string) => {
    toastRef?.show(type, title, message);
  },
    showError: (message: string, title: string = 'Error') => {
    toastRef?.show('error', title, message);
  },

  showSuccess: (message: string, title: string = 'Success') => {
    toastRef?.show('success', title, message);
  },
};

/* ──────────────────────────────────────────────── */

const ToastContext = createContext({
  show: (type: ToastType, title: string, message?: string) => {},
});

export const useToast = () => useContext(ToastContext);

/* ────────────────────────────────────────────────
   Provider
──────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const MAX_TOASTS = 3;

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const show = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts(prev => {
      if (prev.length >= MAX_TOASTS) {
        return [...prev.slice(1), { id, type, title, message }];
      }
      return [...prev, { id, type, title, message }];
    });

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  toastRef = { show };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 60,
          right: 16,
          zIndex: 9999,
          elevation: 9999,
        }}
      >
        {toasts.map((toast, index) => (
          <ToastItemView
            key={toast.id}
            toast={toast}
            index={index}
            colors={colors}
            remove={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/* ────────────────────────────────────────────────
   Toast Item (FINAL POLISH)
──────────────────────────────────────────────── */

function ToastItemView({
  toast,
  index,
  colors,
  remove,
}: {
  toast: ToastItem;
  index: number;
  colors: any;
  remove: () => void;
}) {
  const translateX = React.useRef(new Animated.Value(120)).current;
  const translateY = React.useRef(new Animated.Value(index * 72)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.98)).current;
  const progress = React.useRef(new Animated.Value(1)).current;

  /* ── STACK POSITION (ONLY Y CHANGES) ───────── */

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: index * 72,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [index]);

  /* ── ENTRY (ONLY X) ───────── */

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 🔥 subtle error shake AFTER entry
      if (toast.type === 'error') {
        Animated.sequence([
          Animated.timing(translateX, { toValue: -6, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 6, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -4, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();
      }
    });

    // progress bar
    Animated.timing(progress, {
      toValue: 0,
      duration: 4000,
      useNativeDriver: false,
    }).start();
  }, []);

  /* ── EXIT ───────── */

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 140,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(remove);
  };

  /* ── SWIPE ───────── */

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },

      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 100) {
          animateOut();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const borderColor =
    toast.type === 'success' ? colors.success : colors.error;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        right: 0,
        transform: [{ translateX }, { translateY }, { scale }],
        opacity,
        width: 280,
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
          padding: 12,
          borderRadius: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text
          style={{
            ...typography.styles.button,
            color: colors.text,
          }}
        >
          {toast.title}
        </Text>

        {toast.message && (
          <Text
            style={{
              ...typography.styles.caption,
              color: colors.muted,
              marginTop: 4,
            }}
          >
            {toast.message}
          </Text>
        )}

        {/* 🔥 Progress Bar */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: borderColor,
          }}
        />
      </View>
    </Animated.View>
  );
}