from django.apps import AppConfig


class StructureConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.structure"
    label = 'structure'
    verbose_name = 'Organisations structure'

    def ready(self):
        import apps.structure.signals
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            registry = AppRegistry()
            registry.register_app(
                app_name='structure',
                display_name='Organizations Structures',
                is_critical=False,
                recovery_priority=2,
                rpo_minutes=240,
                rto_minutes=480,
                backup_retention_days=60
            )
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to register structure: {e}") 