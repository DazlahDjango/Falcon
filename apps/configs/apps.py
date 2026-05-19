from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ConfigsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.configs"
    label = 'configs'
    verbose_name = _('Configuration Management')

    def ready(self):
        import apps.configs.signals

