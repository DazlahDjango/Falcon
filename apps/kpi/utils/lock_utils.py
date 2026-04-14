import hashlib
import time
import functools
from typing import Optional, Callable, Any
from django.core.cache import cache
from contextlib import contextmanager
from ..exceptions import LockAcquisitionError

class DistributedLock:
    def __init__(self, key: str, timeout: int = 60, retry_interval: float = 0.1, max_retries: int = 10):
        self.key = key
        self.timeout = timeout
        self.retry_interval = retry_interval
        self.max_retries = max_retries
        self._locked = False
    
    def __enter__(self):
        self.acquire()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()
    
    def acquire(self) -> bool:
        attempts = 0
        while attempts < self.max_retries:
            if cache.add(self.key, 'locked', self.timeout):
                self._locked = True
                return True
            attempts += 1
            time.sleep(self.retry_interval)
        raise LockAcquisitionError(f"Failed to acquire lock for key: {self.key}")
    
    def release(self) -> bool:
        if self._locked:
            cache.delete(self.key)
            self._locked = False
            return True
        return False
    
    @property
    def is_locked(self) -> bool:
        return cache.get(self.key) is not None

class CalculationLock(DistributedLock):
    def __init__(self, tenant_id: str, year: int, month: int):
        key = f"calc_lock:{tenant_id}:{year}:{month:02d}"
        super().__init__(key, timeout=300)  # 5 minutes timeout for calculations

class TenantLock(DistributedLock):
    def __init__(self, tenant_id: str, operation: str):
        key = f"tenant_lock:{tenant_id}:{operation}"
        super().__init__(key, timeout=60)

class CascadeLock(DistributedLock):
    def __init__(self, org_target_id: str):
        key = f"cascade_lock:{org_target_id}"
        super().__init__(key, timeout=120)  # 2 minutes for cascade

class PhasingLock(DistributedLock):
    def __init__(self, annual_target_id: str):
        key = f"phasing_lock:{annual_target_id}"
        super().__init__(key, timeout=60)

def lock_decorator(key_func: Callable, timeout: int = 60, max_retries: int = 10):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            lock_key = key_func(*args, **kwargs)
            lock = DistributedLock(lock_key, timeout=timeout, max_retries=max_retries)
            with lock:
                return func(*args, **kwargs)
        return wrapper
    return decorator

def with_distributed_lock(lock_key: str, timeout: int = 60, max_retries: int = 10):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            lock = DistributedLock(lock_key, timeout=timeout, max_retries=max_retries)
            with lock:
                return func(*args, **kwargs)
        return wrapper
    return decorator

class LOCK_TIMEOUTS:
    CALCULATION = 300      # 5 minutes
    AGGREGATION = 180      # 3 minutes
    CASCADE = 120          # 2 minutes
    PHASING = 60           # 1 minute
    DASHBOARD = 30         # 30 seconds
    IMPORT = 300           # 5 minutes
    EXPORT = 180           # 3 minutes
    NOTIFICATION = 10      # 10 seconds

@contextmanager
def lock_context(lock_key: str, timeout: int = 60, raise_on_fail: bool = True):
    lock = DistributedLock(lock_key, timeout=timeout)
    try:
        lock.acquire()
        yield lock
    finally:
        lock.release()