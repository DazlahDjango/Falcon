import { useState, useEffect, useCallback } from "react";
export const useDebounce = (value, delay = 500) => {
    const [debounceValue, setDebounceValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceValue(value);
        }, delay);
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return debounceValue;
};
export const useDebounceCallback = (callback, delay = 500) => {
    const [timer, setTimer] = useState(null);
    const debounceCallback = useCallback((...args) => {
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);
        setTimer(newTimer);
    }, [callback, delay]);
    useEffect(() => {
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [timer]);
    return debounceCallback;
};