import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay, options = {}) => {
    const savedCallback = useRef();
    const { immediate = false, runOnMount = false } = options;
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        if (delay === null || delay === undefined) return;
        const tick = () => {
            savedCallback.current?.();
        };
        if (runOnMount) {
            tick();
        }
        const id = setInterval(tick, delay);
        if (immediate) {
            tick();
        }
        return () => clearInterval(id);
    }, [delay, immediate, runOnMount]);
};
export const useTimeout = (callback, delay) => {
    const savedCallback = useRef();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        if (delay === null) return;
        const id = setTimeout(() => {
            savedCallback.current?.();
        }, delay);
        return () => clearTimeout(id);
    }, [delay]);
};