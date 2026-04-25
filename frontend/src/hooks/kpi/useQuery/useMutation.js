import { useState, useCallback } from 'react';

const useMutation = (mutationFn, options = {}) => {
    const { onSuccess, onError, onSettled } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const mutate = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await mutationFn(...args);
            setData(result);
            if (onSuccess) onSuccess(result, ...args);
            return result;
        } catch (err) {
            setError(err);
            if (onError) onError(err, ...args);
            throw err;
        } finally {
            setIsLoading(false);
            if (onSettled) onSettled(data, error);
        }
    }, [mutationFn, onSuccess, onError, onSettled]);
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);
    return {
        mutate,
        isLoading,
        error,
        data,
        reset
    };
};
export default useMutation;