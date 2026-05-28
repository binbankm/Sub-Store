import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const Colors = {
  light: {
    primary: '#6C63FF',
    primaryDark: '#5A52D5',
    primaryLight: '#8B83FF',
    secondary: '#FF6584',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    divider: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000',
    inputBg: '#F3F4F6',
    switchTrack: { false: '#D1D5DB', true: '#6C63FF' },
    switchThumb: '#FFFFFF',
    tabBar: '#FFFFFF',
    statusBar: 'dark',
  },
  dark: {
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    secondary: '#FB7185',
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    divider: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: '#000',
    inputBg: '#334155',
    switchTrack: { false: '#475569', true: '#818CF8' },
    switchThumb: '#F1F5F9',
    tabBar: '#1E293B',
    statusBar: 'light',
  },
};

export type ThemeType = 'light' | 'dark' | 'auto';
export type ColorScheme = typeof Colors.light;

interface ThemeContextType {
  theme: ThemeType;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'auto',
  colors: Colors.dark,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('auto');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setThemeState(savedTheme);
      } else {
        setThemeState('auto');
      }
    } catch {
      setThemeState('auto');
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await SecureStore.setItemAsync('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const resolvedTheme = theme === 'auto' ? (systemColorScheme === 'light' ? 'light' : 'dark') : theme;
  const colors = Colors[resolvedTheme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const createStyles = (styleFactory: (colors: ColorScheme) => ReturnType<typeof StyleSheet.create>) => {
  return (colors: ColorScheme) => StyleSheet.create(styleFactory(colors));
};
