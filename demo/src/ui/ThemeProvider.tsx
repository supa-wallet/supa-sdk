import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, type Theme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to system theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const value: ThemeContextValue = {
    theme,
    mode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

