import { useTheme as useThemeContext } from '../../contexts/organisation';

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