import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        const updateMatches = () => {
            setMatches(media.matches);
        };
        updateMatches();
        if (media.addEventListener) {
            media.addEventListener('change', updateMatches);
            return () => media.removeEventListener('change', updateMatches);
        } else {
            media.addListener(updateMatches);
            return () => media.removeListener(updateMatches);
        }
    }, [query]);
    return matches;
};
// Predefined breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');