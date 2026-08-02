# apps/reportplt/apps.py
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class ReportpltConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reportplt'
    verbose_name = _('Reports')

    def ready(self):
        import apps.reportplt.signals
        from apps.reportplt.tasks import sync_report_templates
        try:
            from django.core.cache import cache
            if not cache.get('report_templates_seeded'):
                sync_report_templates.delay()
                cache.set('report_templates_seeded', True, 3600)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not seed report templates on startup: {e}")
        self._register_with_config_app()

    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('reportplt')
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register reportplt with config app: %s', e)