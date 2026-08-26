import { useThemeContext } from '../../contexts/global/ThemeContext';

export const useGlobalTheme = () => {
  return useThemeContext();
};

export default useGlobalTheme;
