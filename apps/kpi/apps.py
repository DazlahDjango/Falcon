from django.apps import AppConfig

class KpiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.kpi'
    label = 'kpi'
    verbose_name = 'KPIs Issuance'

    def ready(self):
        import apps.kpi.signals
        self._register_with_config_app()

    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('kpi')
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register kpi with config app: %s', e)
