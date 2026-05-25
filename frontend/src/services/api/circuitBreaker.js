/**
 * Per-module client-side circuit breaker (Availability).
 */

const breakers = new Map();

const DEFAULT_THRESHOLD = 5;
const DEFAULT_TIMEOUT_MS = 60000;

export function getCircuitBreaker(moduleName, options = {}) {
  const key = moduleName || 'default';
  if (!breakers.has(key)) {
    breakers.set(key, {
      failureCount: 0,
      open: false,
      resetAt: null,
      threshold: options.threshold ?? DEFAULT_THRESHOLD,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
  }
  return breakers.get(key);
}

export function isCircuitOpen(moduleName) {
  const b = getCircuitBreaker(moduleName);
  if (b.open && b.resetAt && Date.now() > b.resetAt) {
    resetCircuitBreaker(moduleName);
    return false;
  }
  return b.open;
}

export function recordCircuitFailure(moduleName, status) {
  if ([401, 403, 404, 400].includes(status)) {
    return;
  }
  const b = getCircuitBreaker(moduleName);
  b.failureCount += 1;
  if (b.failureCount >= b.threshold) {
    b.open = true;
    b.resetAt = Date.now() + b.timeoutMs;
    if (import.meta.env.DEV) {
      console.warn(`[${moduleName}] Circuit breaker opened`);
    }
  }
}

export function recordCircuitSuccess(moduleName) {
  const b = getCircuitBreaker(moduleName);
  b.failureCount = Math.max(0, b.failureCount - 1);
}

export function resetCircuitBreaker(moduleName) {
  const b = getCircuitBreaker(moduleName);
  b.failureCount = 0;
  b.open = false;
  b.resetAt = null;
}
