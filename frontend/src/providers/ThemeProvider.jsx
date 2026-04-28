import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import appConfig from '../config/app.config';

/**
 * Theme Context
 */
const ThemeContext = createContext(null);

/**
 * ThemeProvider - Provides theme state and methods
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem('theme_preference');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            return savedTheme;
        }
        return appConfig.ui.theme.default;
    });

    const [resolvedTheme, setResolvedTheme] = useState('light');

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        
        const resolveTheme = () => {
            if (theme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                return systemDark ? 'dark' : 'light';
            }
            return theme;
        };

        const currentTheme = resolveTheme();
        setResolvedTheme(currentTheme);
        
        if (currentTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }
        
        // Save preference
        localStorage.setItem('theme_preference', theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const newTheme = mediaQuery.matches ? 'dark' : 'light';
            setResolvedTheme(newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    }, []);

    const setLightTheme = useCallback(() => setTheme('light'), []);
    const setDarkTheme = useCallback(() => setTheme('dark'), []);
    const setSystemTheme = useCallback(() => setTheme('system'), []);

    const value = {
        theme,
        resolvedTheme,
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: theme === 'system',
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * useTheme - Hook to access theme context
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export default ThemeProvider;