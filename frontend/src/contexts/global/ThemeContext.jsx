import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme_preference') || localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return theme === 'dark';
    };

    const dark = resolveTheme();
    setIsDarkMode(dark);

    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark', 'dark-mode');
      root.classList.remove('light-mode');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark', 'dark-mode');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('theme_preference', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const dark = e.matches;
      setIsDarkMode(dark);
      const root = document.documentElement;
      if (dark) {
        root.classList.add('dark', 'dark-mode');
        root.classList.remove('light-mode');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark', 'dark-mode');
        root.style.colorScheme = 'light';
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeMode = useCallback((mode) => {
    setTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const value = {
    theme,
    isDarkMode,
    isDark: isDarkMode,
    isLight: !isDarkMode,
    isSystem: theme === 'system',
    setThemeMode,
    toggleTheme,
    setLightTheme: useCallback(() => setTheme('light'), []),
    setDarkTheme: useCallback(() => setTheme('dark'), []),
    setSystemTheme: useCallback(() => setTheme('system'), []),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
