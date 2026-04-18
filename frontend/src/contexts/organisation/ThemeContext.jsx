import React, { createContext, useContext, useState, useEffect } from 'react';
import { brandingApi } from '../../services/organisation/api';
import { useOrganisation } from './OrganisationContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { organisation } = useOrganisation();
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    isDarkMode: false,
    logo: null,
    favicon: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTheme = async () => {
    if (!organisation) return;
    
    try {
      setLoading(true);
      const response = await brandingApi.get();
      const branding = response.data;
      setTheme({
        primaryColor: branding.primary_color || '#3B82F6',
        secondaryColor: branding.secondary_color || '#10B981',
        accentColor: branding.accent_color || '#F59E0B',
        fontFamily: branding.font_family || 'Inter',
        isDarkMode: branding.is_dark_mode || false,
        logo: branding.logo_url,
        favicon: branding.favicon_url,
      });
      
      // Apply CSS variables to document
      applyThemeVariables(branding);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch theme');
      console.error('Error fetching theme:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeVariables = (branding) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primary_color || '#3B82F6');
    root.style.setProperty('--secondary-color', branding.secondary_color || '#10B981');
    root.style.setProperty('--accent-color', branding.accent_color || '#F59E0B');
    root.style.setProperty('--font-family', branding.font_family || 'Inter');
  };

  const updateTheme = async (data) => {
    try {
      const response = await brandingApi.update(data);
      setTheme(prev => ({ ...prev, ...response.data }));
      applyThemeVariables(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const toggleDarkMode = () => {
    const newMode = !theme.isDarkMode;
    setTheme(prev => ({ ...prev, isDarkMode: newMode }));
    document.documentElement.classList.toggle('dark', newMode);
    
    // Persist preference
    localStorage.setItem('darkMode', newMode);
  };

  const uploadLogo = async (file) => {
    try {
      const response = await brandingApi.uploadLogo(file);
      setTheme(prev => ({ ...prev, logo: response.data.logo_url }));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const removeLogo = async () => {
    try {
      await brandingApi.removeLogo();
      setTheme(prev => ({ ...prev, logo: null }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setTheme(prev => ({ ...prev, isDarkMode: savedDarkMode === 'true' }));
      document.documentElement.classList.toggle('dark', savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    if (organisation) {
      fetchTheme();
    }
  }, [organisation]);

  const value = {
    theme,
    loading,
    error,
    updateTheme,
    toggleDarkMode,
    uploadLogo,
    removeLogo,
    refreshTheme: fetchTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};