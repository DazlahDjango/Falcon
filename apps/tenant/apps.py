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
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            registry = AppRegistry()
            registry.register_app(
                app_name='tenant',
                display_name='Tenant Management',
                is_critical=True,
                recovery_priority=1,
                rpo_minutes=15,
                rto_minutes=30,
                backup_retention_days=90
            )
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to register tenant: {e}")
