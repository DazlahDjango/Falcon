import logging
from django.conf import settings
from django.db import transaction
from apps.configs.models import RegisteredApp, BackupPolicy
from apps.configs.constants import BackupType, DEFAULT_RETENTION_DAYS, DEFAULT_RPO_MINUTES, DEFAULT_RTO_MINUTES
from apps.configs.exceptions import AppNotRegisteredError
from apps.configs.services.registry.app_definitions import V1_APP_DEFINITIONS, AppDefinition

logger = logging.getLogger(__name__)


def _resolve_health_endpoint(path: str) -> str:
    if not path:
        return ''
    if path.startswith('http://') or path.startswith('https://'):
        return path
    base = getattr(settings, 'CONFIG_INTERNAL_HEALTH_BASE_URL', None)
    if not base:
        if not getattr(settings, 'DEBUG', True):
            logger.warning(
                "CONFIG_INTERNAL_HEALTH_BASE_URL is not set in settings. "
                "Defaulting to http://127.0.0.1:8000 for internal health check path '%s'.", path
            )
        base = 'http://127.0.0.1:8000'
    base = base.rstrip('/')
    return f"{base}{path}" if path.startswith('/') else f"{base}/{path}"



class AppRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def register_from_definition(self, app_name: str) -> RegisteredApp:
        definition = V1_APP_DEFINITIONS.get(app_name)
        if not definition:
            raise AppNotRegisteredError(f"No canonical definition for app '{app_name}'")
        return self.register_app(
            app_name=definition.name,
            display_name=definition.display_name,
            is_critical=definition.is_critical,
            recovery_priority=definition.recovery_priority,
            rpo_minutes=definition.rpo_minutes,
            rto_minutes=definition.rto_minutes,
            backup_retention_days=definition.backup_retention_days,
            health_check_endpoint=_resolve_health_endpoint(definition.health_check_path),
            metadata={'cia': definition.cia_summary},
            dependencies=list(definition.dependencies) if definition.dependencies else None,
        )

    def sync_all_definitions(self, app_names=None) -> list[RegisteredApp]:
        """Reconcile DB registry with canonical definitions (Integrity). Super-admin action."""
        names = app_names or list(V1_APP_DEFINITIONS.keys())
        synced = []
        for name in names:
            if name not in V1_APP_DEFINITIONS:
                logger.warning("Skipping unknown app name during sync: %s", name)
                continue
            synced.append(self.register_from_definition(name))
        return synced

    def register_app(
        self,
        app_name,
        display_name,
        is_critical=False,
        recovery_priority=3,
        rpo_minutes=DEFAULT_RPO_MINUTES,
        rto_minutes=DEFAULT_RTO_MINUTES,
        backup_retention_days=DEFAULT_RETENTION_DAYS,
        health_check_endpoint=None,
        metadata=None,
        dependencies=None,
    ):
        with transaction.atomic():
            defaults = {
                'display_name': display_name,
                'is_registered': True,
                'is_critical': is_critical,
                'recovery_priority': recovery_priority,
                'rpo_minutes': rpo_minutes,
                'rto_minutes': rto_minutes,
                'backup_retention_days': backup_retention_days,
                'metadata': metadata or {},
            }
            if health_check_endpoint is not None:
                defaults['health_check_endpoint'] = health_check_endpoint

            app, created = RegisteredApp.objects.update_or_create(
                name=app_name,
                defaults=defaults,
            )

            if dependencies is not None:
                from apps.configs.models import AppDependency
                AppDependency.objects.filter(source_app=app).delete()
                for dep_name in dependencies:
                    target_app, _ = RegisteredApp.objects.get_or_create(
                        name=dep_name,
                        defaults={'display_name': dep_name.title(), 'is_registered': False},
                    )
                    AppDependency.objects.get_or_create(
                        source_app=app,
                        target_app=target_app,
                        defaults={'dependency_type': 'hard'},
                    )

            if created:
                BackupPolicy.objects.get_or_create(
                    app=app,
                    defaults={
                        'backup_type': BackupType.FULL,
                        'status': 'enabled',
                        'retention_days': backup_retention_days,
                        'encryption_enabled': True,
                    },
                )
            return app

    def unregister_app(self, app_name):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app:
            raise AppNotRegisteredError(f"App {app_name} not registered")
        app.is_registered = False
        app.save(update_fields=['is_registered', 'updated_at'])
        return app

    def get_registered_app(self, app_name):
        app = RegisteredApp.objects.filter(name=app_name, is_registered=True).first()
        if not app:
            raise AppNotRegisteredError(f"App {app_name} not registered or inactive")
        return app

    def list_registered_apps(self, include_inactive=False):
        qs = RegisteredApp.objects.all()
        if not include_inactive:
            qs = qs.filter(is_registered=True)
        return qs.order_by('recovery_priority', 'name')

    def update_app_health_endpoint(self, app_name, health_endpoint):
        app = self.get_registered_app(app_name)
        app.health_check_endpoint = health_endpoint
        app.save(update_fields=['health_check_endpoint', 'updated_at'])
        return app

    def get_definition(self, app_name: str) -> AppDefinition | None:
        return V1_APP_DEFINITIONS.get(app_name)
