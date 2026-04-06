import { useRef, useEffect } from 'react';

export const usePrevious = (value) => {
    const ref = useRef(); 
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};
export const usePreviousDifferent = (value) => {
    const previousValue = usePrevious(value);
    return value !== previousValue;
};