from django.apps import AppConfig
from django.conf import settings


class TenantConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tenant"
    label = 'tenant'

    def ready(self):
        import apps.tenant.signals  # noqa: F401
        import sys
        is_management_cmd = any('manage.py' in arg for arg in sys.argv)
        if settings.ENABLE_CONNECTION_MIDDLEWARE and not is_management_cmd:
            try:
                from apps.tenant.services import ConnectionCleanupScheduler
                cleanup_scheduler = ConnectionCleanupScheduler()
                cleanup_scheduler.start()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning('Failed to start ConnectionCleanupScheduler: %s', e)
        self._register_with_config_app()

    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('tenant')
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register tenant with config app: %s', e)
