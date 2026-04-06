import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/accounts/useLocalStorage';
import { useMediaQuery } from '../../hooks/accounts/useMediaQuery';
const ThemeContext = createContext(null);
export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};
export const ThemeProvider = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [theme, setTheme] = useLocalStorage('theme', 'system');
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        if (theme === 'system') {
            setIsDarkMode(prefersDarkMode);
        } else {
            setIsDarkMode(theme === 'dark');
        }
    }, [theme, prefersDarkMode]);
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDarkMode]);
    const setThemeMode = useCallback((mode) => {
        setTheme(mode);
    }, [setTheme]);
    const toggleTheme = useCallback(() => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('light');
        } else {
            setTheme(prefersDarkMode ? 'light' : 'dark');
        }
    }, [theme, prefersDarkMode, setTheme]);
    const value = {
        theme,
        isDarkMode,
        setThemeMode,
        toggleTheme
    };
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};