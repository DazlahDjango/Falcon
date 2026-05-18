import signal
import sys
from django.core.cache import cache
from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
from apps.configs.services.maintenance.maintenance_notifier import MaintenanceNotifier
import logging

class FullMaintenance:
    def __init__(self):
        self.mode = MaintenanceMode()
        self.notifier = MaintenanceNotifier()
    def enable(self, window):
        self.mode.enable('full', f"Full system maintenance: {window.reason}. Expected completion: {window.scheduled_end}")
        self.notifier.notify_all_users(window)
        logging.getLogger(__name__).warning(f"FULL MAINTENANCE ENABLED: {window.title}")
        self._signal_workers()
        return True
    def disable(self, window):
        self.mode.disable()
        logging.getLogger(__name__).info(f"Full maintenance disabled: {window.title}")
        return True
    def _signal_workers(self):
        try:
            cache.set('maintenance_stop_workers', True, timeout=300)
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to signal workers: {e}")