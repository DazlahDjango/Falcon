// src/hooks/reviews/useReviewsCache.js
import { useCallback, useMemo } from 'react';
import { cacheUtils } from '../../store/reviews/middleware/reviewMiddleware';

const useReviewsCache = () => {
  const clearCache = useCallback(() => {
    cacheUtils.clearCache();
  }, []);

  const clearResourceCache = useCallback((resourceType) => {
    cacheUtils.clearResourceCache(resourceType);
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheUtils.getCacheSize();
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheUtils.getCacheStats();
  }, []);

  // Pre-defined resource types for convenience
  const clearRatingScalesCache = useCallback(
    () => clearResourceCache('ratingScales'),
    [clearResourceCache]
  );

  const clearCompetenciesCache = useCallback(
    () => clearResourceCache('competencies'),
    [clearResourceCache]
  );

  const clearCyclesCache = useCallback(
    () => clearResourceCache('cycles'),
    [clearResourceCache]
  );

  const clearPIPsCache = useCallback(
    () => clearResourceCache('pips'),
    [clearResourceCache]
  );

  const clearAllCache = useCallback(() => {
    clearCache();
  }, [clearCache]);

  const stats = useMemo(() => getCacheStats(), [getCacheStats]);

  return {
    // General cache operations
    clearCache,
    clearResourceCache,
    getCacheSize,
    getCacheStats,
    stats,

    // Convenience methods
    clearRatingScalesCache,
    clearCompetenciesCache,
    clearCyclesCache,
    clearPIPsCache,
    clearAllCache,

    // Status
    hasCache: getCacheSize() > 0,
    cacheSize: getCacheSize(),
  };
};

export default useReviewsCache;