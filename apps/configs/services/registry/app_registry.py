import logging
from django.db import transaction
from apps.configs.models import RegisteredApp, BackupPolicy
from apps.configs.constants import BackupType, DEFAULT_RETENTION_DAYS, DEFAULT_RPO_MINUTES, DEFAULT_RTO_MINUTES
from apps.configs.exceptions import AppNotRegisteredError

class AppRegistry:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def register_app(self, app_name, display_name, is_critical=False, recovery_priority=3, rpo_minutes=DEFAULT_RPO_MINUTES, rto_minutes=DEFAULT_RTO_MINUTES, backup_retention_days=DEFAULT_RETENTION_DAYS, metadata=None):
        with transaction.atomic():
            app, created = RegisteredApp.objects.update_or_create(
                name=app_name,
                defaults={
                    'display_name': display_name,
                    'is_registered': True,
                    'is_critical': is_critical,
                    'recovery_priority': recovery_priority,
                    'rpo_minutes': rpo_minutes,
                    'rto_minutes': rto_minutes,
                    'backup_retention_days': backup_retention_days,
                    'metadata': metadata or {},
                }
            )
            if created:
                BackupPolicy.objects.get_or_create(
                    app=app,
                    defaults={
                        'backup_type': BackupType.FULL,
                        'status': 'enabled',
                        'retention_days': backup_retention_days,
                        'encryption_enabled': True,
                    }
                )
            return app
    def unregister_app(self, app_name):
        app = RegisteredApp.objects.filter(name=app_name).first()
        if not app:
            raise AppNotRegisteredError(f"App {app_name} not registered")
        app.is_registered = False
        app.save()
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
        return qs.order_by('recovery_priority')
    def update_app_health_endpoint(self, app_name, health_endpoint):
        app = self.get_registered_app(app_name)
        app.health_check_endpoint = health_endpoint
        app.save(update_fields=['health_check_endpoint'])
        return app