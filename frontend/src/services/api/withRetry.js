const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
};

export async function withRetry(fn, options = {}) {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    retryDelay = DEFAULT_RETRY_OPTIONS.retryDelay,
    retryOnStatus = DEFAULT_RETRY_OPTIONS.retryOnStatus,
    logLabel = 'API',
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;
      const shouldRetry = retryOnStatus.includes(status) && attempt < maxRetries;
      if (shouldRetry) {
        if (import.meta.env.DEV) {
          console.warn(`[${logLabel}] Retry ${attempt}/${maxRetries}`);
        }
        await delay(retryDelay * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
