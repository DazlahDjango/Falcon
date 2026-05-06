from django.apps import AppConfig
from django.conf import settings


class TenantConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tenant"
    label = 'tenant'

    def ready(self):
        if settings.ENABLE_CONNECTION_MIDDLEWARE:
            from apps.tenant.services import ConnectionCleanupScheduler
            cleanup_scheduler = ConnectionCleanupScheduler()
            cleanup_scheduler.start()
