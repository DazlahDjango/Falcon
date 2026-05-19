from django.apps import AppConfig

class KpiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.kpi'
    label = 'kpi'
    verbose_name = 'KPIs Issuance'

    def ready(self):
        import apps.kpi.signals
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            registry = AppRegistry()
            registry.register_app(
                app_name='kpi',
                display_name='KPI Engine',
                is_critical=True,
                recovery_priority=1,
                rpo_minutes=60,
                rto_minutes=120,
                backup_retention_days=90
            )
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to register kpi: {e}")
