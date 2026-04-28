import { useEffect, useRef } from 'react';

/**
 * useInterval - Hook for setInterval with cleanup
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 */
const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const tick = () => {
                savedCallback.current();
            };
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export default useInterval;