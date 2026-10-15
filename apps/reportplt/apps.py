# apps/reportplt/apps.py
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class ReportpltConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reportplt'
    verbose_name = _('Reports')

    def ready(self):
        import sys
        import apps.reportplt.signals
        from django.db.models.signals import post_migrate
        post_migrate.connect(self._post_migrate_handler, sender=self)

        cli_commands = {'migrate', 'makemigrations', 'showmigrations', 'sqlmigrate', 'inspectdb', 'collectstatic'}
        if not any(arg in cli_commands for arg in sys.argv):
            try:
                from django.core.cache import cache
                if not cache.get('report_templates_seeded'):
                    from apps.reportplt.tasks import sync_report_templates
                    sync_report_templates.delay()
                    cache.set('report_templates_seeded', True, 3600)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning("Could not seed report templates on startup: %s", e)
        self._register_with_config_app()

    def _post_migrate_handler(self, sender, **kwargs):
        try:
            from apps.reportplt.tasks import sync_report_templates
            sync_report_templates.delay()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("Could not seed report templates on post_migrate: %s", e)

    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('reportplt')
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register reportplt with config app: %s', e)