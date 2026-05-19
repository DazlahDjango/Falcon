from django.core.management.base import BaseCommand
from apps.configs.services.registry.app_registry import AppRegistry

class Command(BaseCommand):
    help = 'Register all V1 Falcon apps with the Config system'

    def handle(self, *args, **options):
        registry = AppRegistry()
        
        apps = [
            ('accounts', 'Accounts & Authentication', True, 1, 15, 30, 90),
            ('kpi', 'KPI Engine', True, 1, 60, 120, 90),
            ('tenant', 'Tenant Management', True, 1, 15, 30, 90),
            ('structure', 'Organization Structure', False, 2, 120, 240, 60),
            ('billing', 'Billing & Subscription', False, 2, 240, 480, 60),
            ('reviews', 'Performance Reviews', False, 3, 240, 480, 30),
            ('dashboard', 'Dashboard & Analytics', False, 3, 480, 720, 30),
        ]
        
        self.stdout.write('Registering apps with Config system...')
        
        for name, display, critical, priority, rpo, rto, retention in apps:
            try:
                registry.register_app(
                    app_name=name,
                    display_name=display,
                    is_critical=critical,
                    recovery_priority=priority,
                    rpo_minutes=rpo,
                    rto_minutes=rto,
                    backup_retention_days=retention
                )
                self.stdout.write(self.style.SUCCESS(f'  ✓ Registered {name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Failed to register {name}: {e}'))
        
        self.stdout.write(self.style.SUCCESS('\nAll apps registered successfully!'))