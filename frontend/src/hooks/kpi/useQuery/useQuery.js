import { useState, useEffect, useCallback, useRef } from 'react';

const useQuery = (queryFn, deps = [], options = {}) => {
    const { enabled = true, staleTime = 0, cacheKey } = options;
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const cache = useRef(new Map());
    const lastFetchTime = useRef(null);
    const fetchData = useCallback(async (force = false) => {
        // Check cache
        if (!force && cacheKey && cache.current.has(cacheKey)) {
            const cached = cache.current.get(cacheKey);
            const isStale = lastFetchTime.current && 
                Date.now() - lastFetchTime.current > staleTime * 1000;
            
            if (!isStale) {
                setData(cached);
                return cached;
            }
        }
        setIsFetching(true);
        setIsLoading(true);
        setError(null);
        try {
            const result = await queryFn();
            setData(result);
            if (cacheKey) {
                cache.current.set(cacheKey, result);
                lastFetchTime.current = Date.now();
            }
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, [queryFn, cacheKey, staleTime]);
    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, ...deps]);
    const refetch = useCallback((force = false) => fetchData(force), [fetchData]);
    const clearCache = useCallback(() => {
        if (cacheKey) {
            cache.current.delete(cacheKey);
        }
    }, [cacheKey]);
    return {
        data,
        isLoading,
        error,
        isFetching,
        refetch,
        clearCache
    };
};
export default useQuery;