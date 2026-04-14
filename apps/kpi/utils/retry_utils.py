import time
import functools
import logging
from typing import Callable, Any, Optional, List, Union
from enum import Enum
logger = logging.getLogger(__name__)

class RetryConfig:
    def __init__(self, max_retries: int = 3, delay: float = 1.0, 
                 backoff_multiplier: float = 2.0, max_delay: float = 60.0,
                 retry_on_exceptions: Optional[List[type]] = None):
        self.max_retries = max_retries
        self.delay = delay
        self.backoff_multiplier = backoff_multiplier
        self.max_delay = max_delay
        self.retry_on_exceptions = retry_on_exceptions or [Exception]
    
    def get_delay(self, attempt: int) -> float:
        delay = self.delay * (self.backoff_multiplier ** attempt)
        return min(delay, self.max_delay)

class RetryContext:
    def __init__(self, config: RetryConfig):
        self.config = config
        self.attempts = 0
        self.last_error = None
    
    def should_retry(self) -> bool:
        return self.attempts < self.config.max_retries
    
    def record_attempt(self, error: Exception = None) -> None:
        self.attempts += 1
        if error:
            self.last_error = error
    
    def get_next_delay(self) -> float:
        return self.config.get_delay(self.attempts)

class RetryUtils:
    @classmethod
    def retry(cls, func: Callable, config: RetryConfig = None, 
              *args, **kwargs) -> Any:
        config = config or RetryConfig()
        context = RetryContext(config)
        while context.should_retry():
            try:
                return func(*args, **kwargs)
            except tuple(config.retry_on_exceptions) as e:
                context.record_attempt(e)
                if not context.should_retry():
                    logger.error(f"Function failed after {context.attempts} attempts: {e}")
                    raise
                delay = context.get_next_delay()
                logger.warning(f"Retry {context.attempts}/{config.max_retries} after {delay}s: {e}")
                time.sleep(delay)
        raise context.last_error
    
    @classmethod
    def retry_async(cls, func, config: RetryConfig = None, *args, **kwargs):
        import asyncio
        config = config or RetryConfig()
        context = RetryContext(config)
        async def _execute():
            while context.should_retry():
                try:
                    return await func(*args, **kwargs)
                except tuple(config.retry_on_exceptions) as e:
                    context.record_attempt(e)
                    if not context.should_retry():
                        logger.error(f"Async function failed after {context.attempts} attempts: {e}")
                        raise
                    delay = context.get_next_delay()
                    logger.warning(f"Retry {context.attempts}/{config.max_retries} after {delay}s: {e}")
                    await asyncio.sleep(delay)
            raise context.last_error
        return _execute()

def retry_on_failure(max_retries: int = 3, delay: float = 1.0, 
                     backoff_multiplier: float = 2.0,
                     retry_on_exceptions: List[type] = None):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            config = RetryConfig(
                max_retries=max_retries,
                delay=delay,
                backoff_multiplier=backoff_multiplier,
                retry_on_exceptions=retry_on_exceptions
            )
            return RetryUtils.retry(func, config, *args, **kwargs)
        return wrapper
    return decorator


def exponential_backoff(attempt: int, base_delay: float = 1.0, 
                        max_delay: float = 60.0) -> float:
    delay = base_delay * (2 ** attempt)
    return min(delay, max_delay)

def with_retry(config: RetryConfig = None):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return RetryUtils.retry(func, config, *args, **kwargs)
        return wrapper
    return decorator

class RetryableOperation:
    def __init__(self, config: RetryConfig = None):
        self.config = config or RetryConfig()
        self.context = RetryContext(self.config)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val and self.context.should_retry():
            self.context.record_attempt(exc_val)
            delay = self.context.get_next_delay()
            time.sleep(delay)
            return True  # Suppress exception for retry
        return False  # Let exception propagate
    
    def execute(self, func: Callable, *args, **kwargs) -> Any:
        with self:
            return func(*args, **kwargs)