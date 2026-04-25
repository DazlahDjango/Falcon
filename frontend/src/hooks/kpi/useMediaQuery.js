import { useState, useEffect } from 'react';

/**
 * useMediaQuery - Hook for responsive design
 * @param {string} query - CSS media query
 */
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        
        const listener = (event) => {
            setMatches(event.matches);
        };
        
        media.addEventListener('change', listener);
        
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query, matches]);

    return matches;
};

// Predefined breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

export default useMediaQuery;