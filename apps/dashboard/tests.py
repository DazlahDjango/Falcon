from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.dashboard.services.super_admin_service import SuperAdminDashboardService
from apps.configs.models import RegisteredApp, BackupJob

User = get_user_model()

class SuperAdminDashboardServiceTestCase(TestCase):
    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            email='superadmin@dashboard.com',
            username='superdashboard',
            password='Password123!',
            role='super_admin'
        )
        RegisteredApp.objects.get_or_create(
            name='dashboard',
            defaults={
                'display_name': 'Role-based Dashboards',
                'is_registered': True,
                'is_critical': False,
                'database_table_name': 'dashboard_cache',
            }
        )

    def test_super_admin_dashboard_service_includes_configs_overview(self):
        service = SuperAdminDashboardService(self.super_admin, None)
        data = service.get_dashboard_data()
        self.assertEqual(data['dashboard_type'], 'super_admin')
        self.assertIn('configs_overview', data)
        self.assertIn('registered_apps', data['configs_overview'])
        self.assertIn('maintenance_active', data['configs_overview'])

