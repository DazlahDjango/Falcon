import { useTheme as useThemeContext } from '../../hooks/organisations/useTeams';

export const useTheme = () => {
  const { 
    theme, 
    loading, 
    error, 
    updateTheme, 
    toggleDarkMode, 
    uploadLogo, 
    removeLogo, 
    refreshTheme 
  } = useThemeContext();
  
  return { 
    theme, 
    loading, 
    error, 
    updateTheme, 
    toggleDarkMode, 
    uploadLogo, 
    removeLogo, 
    refreshTheme 
  };
};