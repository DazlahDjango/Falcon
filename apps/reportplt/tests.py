from django.test import TestCase
from rest_framework.test import APIClient
from apps.reportplt.models import Report, ReportTemplate, ReportDashboard

class ReportPltSmokeTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_imports_and_models(self):
        # Simply ensure models can be imported and querysets created
        self.assertEqual(Report.objects.count(), 0)
        self.assertEqual(ReportTemplate.objects.count(), 0)
        self.assertEqual(ReportDashboard.objects.count(), 0)

    def test_reportplt_registration_and_maintenance_pause(self):
        from apps.configs.models import RegisteredApp, MaintenanceWindow
        from apps.configs.services.maintenance.full_maintenance import FullMaintenance
        from apps.configs.services.registry.app_registry import AppRegistry
        from apps.reportplt.tasks import generate_report_task

        AppRegistry().register_from_definition('reportplt')
        app = RegisteredApp.objects.filter(name='reportplt').first()
        self.assertIsNotNone(app)
        self.assertTrue(app.is_registered)

        window = MaintenanceWindow.objects.create(
            title='Report Maintenance Test',
            maintenance_type='full',
            scheduled_start=app.created_at,
            scheduled_end=app.created_at,
            triggered_by='00000000-0000-0000-0000-000000000000',
            triggered_by_role='super_admin',
            reason='System Maintenance',
            expected_downtime_minutes=10,
        )
        FullMaintenance().enable(window)

        import uuid
        res = generate_report_task(str(uuid.uuid4()))
        self.assertEqual(res.get('status'), 'paused')


        FullMaintenance().disable(window)


