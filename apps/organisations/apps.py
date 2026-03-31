from django.apps import AppConfig

class OrganisationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.organisations'
    verbose_name = 'Organisation Management'

    def ready(self):
        try:
            import apps.organisations.signals
        except ImportError:
            pass