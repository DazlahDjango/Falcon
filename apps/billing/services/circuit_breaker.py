from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class CircuitBreakerRegistry:
    _instances = {}

    @classmethod
    def get(cls, name: str, failure_threshold: int = 5, timeout_seconds: int = 60):
        if name not in cls._instances:
            cls._instances[name] = CircuitBreaker(name, failure_threshold, timeout_seconds)
        return cls._instances[name]

class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, timeout_seconds: int = 60):
        self.name = name
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds

    def get_state(self) -> str:
        return cache.get(f"circuit:{self.name}:state", 'CLOSED')

    def get_failures(self) -> int:
        return cache.get(f"circuit:{self.name}:failures", 0)

    def record_failure(self):
        failures = self.get_failures() + 1
        cache.set(f"circuit:{self.name}:failures", failures)
        if failures >= self.failure_threshold:
            cache.set(f"circuit:{self.name}:state", 'OPEN')
            cache.set(f"circuit:{self.name}:opened_at", timezone.now())
            logger.warning(f"Circuit {self.name} opened after {failures} failures")

    def record_success(self):
        if self.get_state() == 'HALF_OPEN':
            cache.set(f"circuit:{self.name}:state", 'CLOSED')
            cache.delete(f"circuit:{self.name}:failures")
            logger.info(f"Circuit {self.name} closed after successful call")

    def call(self, func, *args, **kwargs):
        state = self.get_state()
        if state == 'OPEN':
            opened_at = cache.get(f"circuit:{self.name}:opened_at")
            if opened_at and (timezone.now() - opened_at).total_seconds() > self.timeout_seconds:
                cache.set(f"circuit:{self.name}:state", 'HALF_OPEN')
                logger.info(f"Circuit {self.name} HALF_OPEN for trial")
            else:
                raise Exception(f"Circuit {self.name} is OPEN")

        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure()
            raise e