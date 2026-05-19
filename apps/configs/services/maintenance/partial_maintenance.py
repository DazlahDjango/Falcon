from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
import logging

class PartialMaintenance:
    def __init__(self):
        self.mode = MaintenanceMode()
    def enable(self, window):
        affected = list(window.affected_apps.values_list('name', flat=True))
        self.mode.enable('partial', f"Partial maintenance: {window.reason}", affected_apps=affected)
        logging.getLogger(__name__).warning(f"PARTIAL MAINTENANCE ENABLED for apps: {affected}")
        return True
    def disable(self, window):
        self.mode.disable()
        logging.getLogger(__name__).info(f"Partial maintenance disabled: {window.title}")
        return True
    def is_app_blocked(self, app_name):
        if not self.mode.is_active():
            return False
        if self.mode.get_type() != 'partial':
            return False
        return app_name in self.mode.get_affected_apps()