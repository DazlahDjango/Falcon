from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ConfigsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.configs"
    label = 'configs'
    verbose_name = _('Configuration Management')

    def ready(self):
        import apps.configs.signals
        self._register_with_config_app()
        self._ensure_system_settings()

    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('configs')
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register configs app with registry: %s', e)

    def _ensure_system_settings(self):
        try:
            from apps.configs.services.settings import ConfigSettingsService
            ConfigSettingsService.get_settings(use_cache=False)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to initialize system settings: %s', e)
