import { useRef, useEffect } from 'react';

/**
 * usePrevious - Hook to get previous value
 * @param {any} value - Current value
 */
const usePrevious = (value) => {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};

export default usePrevious;