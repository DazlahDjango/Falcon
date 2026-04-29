import { useEffect, useRef } from 'react';

/**
 * useClickOutside - Hook to detect clicks outside an element
 * @param {Function} handler - Click outside handler
 * @param {boolean} enabled - Whether hook is enabled
 */
const useClickOutside = (handler, enabled = true) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                handler(event);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
};

export default useClickOutside;