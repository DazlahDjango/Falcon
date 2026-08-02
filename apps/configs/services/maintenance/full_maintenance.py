import signal
import sys
from django.core.cache import cache
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
from apps.configs.services.maintenance.maintenance_notifier import MaintenanceNotifier
import logging

class FullMaintenance:
    WORKER_STOP_CACHE_KEY = 'maintenance_stop_workers'

    def __init__(self):
        self.mode = MaintenanceMode()
        self.notifier = MaintenanceNotifier()

    @classmethod
    def is_worker_stop_requested(cls) -> bool:
        """Check if background worker processes are requested to halt/pause."""
        try:
            return bool(cache.get(cls.WORKER_STOP_CACHE_KEY, False))
        except Exception:
            return False

    def enable(self, window):
        self.mode.enable('full', f"Full system maintenance: {window.reason}. Expected completion: {window.scheduled_end}")
        self.notifier.notify_all_users(window)
        logging.getLogger(__name__).warning(f"FULL MAINTENANCE ENABLED: {window.title}")
        self._signal_workers()
        return True

    def disable(self, window):
        self.mode.disable()
        try:
            cache.delete(self.WORKER_STOP_CACHE_KEY)
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to clear worker signal key: {e}")
        logging.getLogger(__name__).info(f"Full maintenance disabled: {window.title}")
        return True

    def _signal_workers(self):
        try:
            cache.set(self.WORKER_STOP_CACHE_KEY, True, timeout=86400)
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to signal workers: {e}")