import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  cardSecondary: string;
  elevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  inputBg: string;
  badgeBg: string;
  modalOverlay: string;

  /**
   * CRITICAL CONSTRAINT (Section 8):
   * Product photographs and studio canvases MUST NOT be darkened, inverted, or color-shifted in dark mode.
   * These tokens remain fixed neutral across both light and dark themes.
   */
  productCanvas: string;
  productBackdropIvory: string;
  productBackdropGray: string;
  productBackdropWhite: string;
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: 'transparent',
  surface: 'rgba(250, 248, 241, 0.85)',
  card: 'rgba(240, 238, 230, 0.95)',
  cardSecondary: '#E9E5DC',
  elevated: '#FFFFFF',
  text: '#252525',
  textSecondary: '#65779B',
  textMuted: '#9BA3AF',
  textInverse: '#FFFFFF',
  border: '#D8D4CC',
  borderLight: '#EBE7DF',
  primary: '#394B72',
  primaryLight: '#65779B',
  primaryDark: '#2C3A5A',
  accent: '#D49A32',
  success: '#16A34A',
  warning: '#D49A32',
  danger: '#DC2626',
  info: '#394B72',
  inputBg: '#FFFFFF',
  badgeBg: '#E9E5DC',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',

  // Fixed photo container colors
  productCanvas: '#FFFFFF',
  productBackdropIvory: '#FAF7F2',
  productBackdropGray: '#F4F4F5',
  productBackdropWhite: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  isDark: true,
  background: 'transparent',
  surface: 'rgba(21, 29, 44, 0.85)',
  card: 'rgba(21, 29, 44, 0.95)',
  cardSecondary: '#1E293B',
  elevated: '#243044',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F19',
  border: '#2A3649',
  borderLight: '#1E293B',
  primary: '#F97316',
  primaryLight: '#2C1B10',
  primaryDark: '#FB923C',
  accent: '#818CF8',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',
  inputBg: '#1E293B',
  badgeBg: '#1E293B',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',

  // Fixed photo container colors - preserved neutral to protect artisan craft fidelity
  productCanvas: '#FFFFFF',
  productBackdropIvory: '#FAF7F2',
  productBackdropGray: '#F4F4F5',
  productBackdropWhite: '#FFFFFF',
};

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),
}));

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeModeStore = useThemeStore((s) => s.setThemeMode);

  useEffect(() => {
    AsyncStorage.getItem('preferredTheme').then((saved) => {
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeModeStore(saved as ThemeMode);
      }
    });
  }, [setThemeModeStore]);

  const effectiveScheme = themeMode === 'system' ? (systemScheme || 'light') : themeMode;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeStore(mode);
    await AsyncStorage.setItem('preferredTheme', mode);
  };

  return {
    themeMode,
    isDark,
    colors,
    setThemeMode,
    theme: effectiveScheme,
  };
}
