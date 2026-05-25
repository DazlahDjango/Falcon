"""
Circuit breaker for cross-app calls (Structure, Accounts, KPI).
Prevents cascade failures; falls back when open.
"""

import logging
import time
from threading import Lock
from typing import Any, Callable, Optional

from apps.reviews.services.settings import ReviewsSettingsService

logger = logging.getLogger(__name__)

_breakers: dict = {}
_lock = Lock()


class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, reset_seconds: int = 60):
        self.name = name
        self.failure_threshold = failure_threshold
        self.reset_seconds = reset_seconds
        self._failures = 0
        self._opened_at: Optional[float] = None
        self._lock = Lock()

    @property
    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        if time.time() - self._opened_at >= self.reset_seconds:
            self._reset()
            return False
        return True

    def _reset(self) -> None:
        self._failures = 0
        self._opened_at = None

    def record_success(self) -> None:
        with self._lock:
            self._reset()

    def record_failure(self) -> None:
        with self._lock:
            self._failures += 1
            if self._failures >= self.failure_threshold:
                self._opened_at = time.time()
                logger.warning('Circuit breaker OPEN: %s', self.name)

    def call(self, fn: Callable, fallback: Callable = None, *args, **kwargs) -> Any:
        cfg = ReviewsSettingsService.get_section('availability')
        if not cfg.get('circuit_breaker_enabled', True):
            return fn(*args, **kwargs)
        if self.is_open:
            if fallback and cfg.get('external_call_fallback_enabled', True):
                logger.debug('Circuit open %s — using fallback', self.name)
                return fallback(*args, **kwargs)
            raise RuntimeError(f'Circuit breaker open: {self.name}')
        try:
            result = fn(*args, **kwargs)
            self.record_success()
            return result
        except Exception:
            self.record_failure()
            if fallback and cfg.get('external_call_fallback_enabled', True):
                return fallback(*args, **kwargs)
            raise


def get_breaker(name: str) -> CircuitBreaker:
    cfg = ReviewsSettingsService.get_section('availability')
    threshold = cfg.get('circuit_breaker_failure_threshold', 5)
    reset = cfg.get('circuit_breaker_reset_seconds', 60)
    with _lock:
        if name not in _breakers:
            _breakers[name] = CircuitBreaker(name, threshold, reset)
        return _breakers[name]
