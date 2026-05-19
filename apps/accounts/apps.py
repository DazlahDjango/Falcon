from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    label = 'accounts'
    verbose_name = 'Accounts & Authentication'

    def ready(self):
        import apps.accounts.signals
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            registry = AppRegistry()
            registry.register_app(
                app_name='accounts',
                display_name='Accounts & Authentication',
                is_critical=True,
                recovery_priority=1,
                rpo_minutes=15,
                rto_minutes=30,
                backup_retention_days=90
            )
        except ImportError:
            pass  # Config app not installed yet
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to register accounts: {e}")