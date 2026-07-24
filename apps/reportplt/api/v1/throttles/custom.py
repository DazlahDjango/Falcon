# apps/reportplt/api/v1/throttles/custom.py
import time
import math
from typing import Optional, Tuple, List
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import BaseThrottle, SimpleRateThrottle

class BurstThrottle(BaseThrottle):
    """
    Allows bursts of requests but limits sustained rate.
    """
    
    def __init__(self, burst_rate: str = '5/sec', sustained_rate: str = '100/hour'):
        self.burst_limit, self.burst_period = self._parse_rate(burst_rate)
        self.sustained_limit, self.sustained_period = self._parse_rate(sustained_rate)
    
    def _parse_rate(self, rate: str) -> Tuple[int, int]:
        num, unit = rate.split('/')
        period_map = {'sec': 1, 'second': 1, 'min': 60, 'minute': 60, 'hour': 3600, 'day': 86400}
        return int(num), period_map.get(unit, 60)
    
    def get_cache_key(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            return f"burst:{str(request.user.id)}:{view.__class__.__name__}"
        return f"burst:anon:{self.get_ident(request)}"
    
    def allow_request(self, request, view):
        key = self.get_cache_key(request, view)
        if not key:
            return True
        data = cache.get(key, {'burst': [], 'sustained': []})
        now = time.time()
        burst_cutoff = now - self.burst_period
        sustained_cutoff = now - self.sustained_period
        data['burst'] = [ts for ts in data.get('burst', []) if ts > burst_cutoff]
        data['sustained'] = [ts for ts in data.get('sustained', []) if ts > sustained_cutoff]
        if len(data['burst']) >= self.burst_limit:
            self.wait = self.burst_period - (now - data['burst'][0])
            return False
        if len(data['sustained']) >= self.sustained_limit:
            self.wait = self.sustained_period - (now - data['sustained'][0])
            return False
        data['burst'].append(now)
        data['sustained'].append(now)
        cache.set(key, data, self.sustained_period)
        self.wait = 0
        return True
    
    def wait(self):
        return self.wait

class MultiResourceThrottle(BaseThrottle):
    """
    Rate limit across multiple resources.
    """
    
    def __init__(self, resources: List[str], rate: str = '50/hour'):
        self.resources = resources
        self.limit, self.period = self._parse_rate(rate)
    
    def _parse_rate(self, rate: str) -> Tuple[int, int]:
        num, unit = rate.split('/')
        period_map = {'sec': 1, 'second': 1, 'min': 60, 'minute': 60, 'hour': 3600, 'day': 86400}
        return int(num), period_map.get(unit, 3600)
    
    def get_cache_key(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            return f"multi:{str(request.user.id)}"
        return f"multi:anon:{self.get_ident(request)}"
    
    def get_resource_weight(self, request) -> int:
        path = request.path
        for i, resource in enumerate(self.resources):
            if resource in path:
                return i + 1
        return 1
    
    def allow_request(self, request, view):
        key = self.get_cache_key(request, view)
        if not key:
            return True
        weight = self.get_resource_weight(request)
        data = cache.get(key, {'usage': 0, 'reset_at': time.time() + self.period})
        now = time.time()
        if now > data.get('reset_at', 0):
            data = {'usage': 0, 'reset_at': now + self.period}
        if data['usage'] + weight > self.limit:
            self.wait = data['reset_at'] - now
            return False
        data['usage'] += weight
        cache.set(key, data, self.period)
        self.wait = 0
        return True

class TimeWindowThrottle(BaseThrottle):
    """
    Rate limit with sliding time window.
    """
    
    def __init__(self, rate: str = '100/hour'):
        self.limit, self.period = self._parse_rate(rate)
    
    def _parse_rate(self, rate: str) -> Tuple[int, int]:
        num, unit = rate.split('/')
        period_map = {'sec': 1, 'second': 1, 'min': 60, 'minute': 60, 'hour': 3600, 'day': 86400}
        return int(num), period_map.get(unit, 3600)
    
    def get_cache_key(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            return f"window:{str(request.user.id)}"
        return f"window:anon:{self.get_ident(request)}"
    
    def allow_request(self, request, view):
        key = self.get_cache_key(request, view)
        if not key:
            return True
        timestamps = cache.get(key, [])
        now = time.time()
        cutoff = now - self.period
        timestamps = [ts for ts in timestamps if ts > cutoff]
        if len(timestamps) >= self.limit:
            self.wait = self.period - (now - timestamps[0])
            return False
        timestamps.append(now)
        cache.set(key, timestamps, self.period)
        self.wait = 0
        return True

class AdaptiveThrottle(BaseThrottle):
    """
    Adaptive throttle that adjusts based on system load.
    """
    
    def __init__(self, base_rate: str = '100/hour', load_factor: float = 1.0):
        self.base_limit, self.base_period = self._parse_rate(base_rate)
        self.load_factor = load_factor
    
    def _parse_rate(self, rate: str) -> Tuple[int, int]:
        num, unit = rate.split('/')
        period_map = {'sec': 1, 'second': 1, 'min': 60, 'minute': 60, 'hour': 3600, 'day': 86400}
        return int(num), period_map.get(unit, 3600)
    
    def get_cache_key(self, request, view) -> str:
        if request.user and request.user.is_authenticated:
            return f"adaptive:{str(request.user.id)}"
        return f"adaptive:anon:{self.get_ident(request)}"
    
    def get_system_load(self) -> float:
        try:
            import psutil
            return psutil.cpu_percent(interval=0.1) / 100
        except:
            return 0.5
    
    def allow_request(self, request, view):
        load = self.get_system_load()
        adjusted_limit = int(self.base_limit * (1 - load * self.load_factor))
        adjusted_limit = max(1, adjusted_limit)
        key = self.get_cache_key(request, view)
        if not key:
            return True
        timestamps = cache.get(key, [])
        now = time.time()
        cutoff = now - self.base_period
        timestamps = [ts for ts in timestamps if ts > cutoff]
        if len(timestamps) >= adjusted_limit:
            self.wait = self.base_period - (now - timestamps[0])
            return False
        timestamps.append(now)
        cache.set(key, timestamps, self.base_period)
        self.wait = 0
        return True

class PriorityThrottle(BaseThrottle):
    """
    Rate limit based on request priority.
    """
    
    def __init__(self):
        self.priority_limits = {
            'high': {'limit': 100, 'period': 3600},
            'medium': {'limit': 50, 'period': 3600},
            'low': {'limit': 10, 'period': 3600},
        }
    
    def get_priority(self, request) -> str:
        priority = request.headers.get('X-Priority', 'medium')
        return priority if priority in self.priority_limits else 'medium'
    
    def get_cache_key(self, request, view) -> str:
        priority = self.get_priority(request)
        if request.user and request.user.is_authenticated:
            return f"priority:{priority}:{str(request.user.id)}"
        return f"priority:{priority}:anon:{self.get_ident(request)}"
    
    def allow_request(self, request, view):
        priority = self.get_priority(request)
        limit = self.priority_limits[priority]['limit']
        period = self.priority_limits[priority]['period']
        key = self.get_cache_key(request, view)
        if not key:
            return True
        timestamps = cache.get(key, [])
        now = time.time()
        cutoff = now - period
        timestamps = [ts for ts in timestamps if ts > cutoff]
        if len(timestamps) >= limit:
            self.wait = period - (now - timestamps[0])
            return False
        timestamps.append(now)
        cache.set(key, timestamps, period)
        self.wait = 0
        return True

class CombinedThrottle(BaseThrottle):
    """
    Combines multiple throttle strategies.
    """
    
    def __init__(self, throttles: List[BaseThrottle]):
        self.throttles = throttles
    
    def allow_request(self, request, view):
        for throttle in self.throttles:
            if not throttle.allow_request(request, view):
                self.wait = throttle.wait if hasattr(throttle, 'wait') else 0
                return False
        self.wait = 0
        return True
    
    def wait(self):
        return self.wait