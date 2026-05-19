from django.core.cache import cache
from django.conf import settings
import threading

class MaintenanceMode:
    _instance = None
    _lock = threading.Lock()
    _cache_key = 'maintenance_mode_active'
    _cache_key_type = 'maintenance_mode_type'
    _cache_key_message = 'maintenance_mode_message'
    _cache_key_affected_apps = 'maintenance_mode_affected_apps'
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def is_active(self):
        return cache.get(self._cache_key, False)
    
    def get_type(self):
        return cache.get(self._cache_key_type, 'none')
    
    def get_message(self):
        return cache.get(self._cache_key_message, 'System is under maintenance. Please try again later.')
    
    def get_affected_apps(self):
        return cache.get(self._cache_key_affected_apps, [])
    
    def enable(self, maintenance_type, message, affected_apps=None):
        cache.set(self._cache_key, True, timeout=None)
        cache.set(self._cache_key_type, maintenance_type, timeout=None)
        cache.set(self._cache_key_message, message, timeout=None)
        if affected_apps:
            cache.set(self._cache_key_affected_apps, affected_apps, timeout=None)
    
    def disable(self):
        cache.delete(self._cache_key)
        cache.delete(self._cache_key_type)
        cache.delete(self._cache_key_message)
        cache.delete(self._cache_key_affected_apps)
    
    def is_app_affected(self, app_name):
        if not self.is_active():
            return False
        if self.get_type() == 'full':
            return True
        affected = self.get_affected_apps()
        return app_name in affected