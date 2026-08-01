from django.test import TestCase
from django.core.cache import cache
from apps.configs.models import RegisteredApp, BackupPolicy, BackupJob, BackupArtifact, MaintenanceWindow
from apps.configs.services.backup.database_dump_service import DatabaseDumpService
from apps.configs.services.backup.single_app_backup import SingleAppBackup
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.services.maintenance.full_maintenance import FullMaintenance
from apps.configs.services.security.access_enforcer import AccessEnforcer
from apps.configs.services.registry.app_registry import AppRegistry, _resolve_health_endpoint
from apps.configs.exceptions import PermissionDeniedError


class ConfigsServicesTestCase(TestCase):
    def setUp(self):
        cache.clear()
        self.app, _ = RegisteredApp.objects.get_or_create(
            name='configs',
            defaults={
                'display_name': 'Configuration Management',
                'is_registered': True,
                'is_critical': True,
                'recovery_priority': 1,
                'database_table_name': 'config_registered_app',
            }
        )
        # Fetch auto-created backup policy from signals or create if missing
        self.policy = BackupPolicy.objects.filter(app=self.app).first()
        if not self.policy:
            self.policy = BackupPolicy.objects.create(
                app=self.app,
                backup_type='full',
                status='enabled',
                retention_days=30,
                encryption_enabled=False,
                compression_enabled=True,
                compression_algorithm='zstd',
            )
        else:
            self.policy.status = 'enabled'
            self.policy.encryption_enabled = False
            self.policy.compression_enabled = True
            self.policy.compression_algorithm = 'zstd'
            self.policy.save()


    def test_database_dump_service_availability(self):
        is_dump = DatabaseDumpService.is_pg_dump_available()
        is_restore = DatabaseDumpService.is_pg_restore_available()
        self.assertIsInstance(is_dump, bool)
        self.assertIsInstance(is_restore, bool)

    def test_single_app_backup_and_restore_in_memory(self):
        backup_service = SingleAppBackup()
        result = backup_service.execute('configs', 'full')
        self.assertIn('checksum', result)
        self.assertIn('storage_path', result)
        self.assertGreater(result['size_bytes'], 0)

        # Create BackupJob & BackupArtifact records to test restore
        job = BackupJob.objects.create(
            app=self.app,
            backup_type='full',
            status='completed',
            size_bytes=result['size_bytes'],
            checksum=result['checksum'],
            triggered_by='00000000-0000-0000-0000-000000000000',
            triggered_by_role='super_admin',
            metadata={
                'dump_format': result.get('dump_format', 'json'),
                'compression_algorithm': result.get('compression_algorithm'),
            }
        )

        BackupArtifact.objects.create(
            backup_job=job,
            storage_location=result['storage_location'],
            storage_path=result['storage_path'],
            status='uploaded',
        )

        restore_service = SingleAppRestore()
        restore_result = restore_service.execute('configs', job.id)
        self.assertEqual(restore_result['status'], 'success')

    def test_full_maintenance_worker_signaling(self):
        maintenance = FullMaintenance()
        window = MaintenanceWindow.objects.create(
            title='Test System Maintenance',
            maintenance_type='full',
            scheduled_start=self.app.created_at,
            scheduled_end=self.app.created_at,
            triggered_by='00000000-0000-0000-0000-000000000000',
            triggered_by_role='super_admin',
            reason='System Upgrade',
            expected_downtime_minutes=30,
        )

        self.assertFalse(FullMaintenance.is_worker_stop_requested())
        maintenance.enable(window)
        self.assertTrue(FullMaintenance.is_worker_stop_requested())
        maintenance.disable(window)
        self.assertFalse(FullMaintenance.is_worker_stop_requested())

    def test_access_enforcer_tenant_isolation(self):
        enforcer = AccessEnforcer()
        # Super admin bypasses tenant checks
        self.assertTrue(enforcer.enforce_tenant_access('tenant-1', 'tenant-2', user_role='super_admin'))
        # Client admin matching tenant passes
        self.assertTrue(enforcer.enforce_tenant_access('tenant-1', 'tenant-1', user_role='client_admin'))
        # Client admin mismatched tenant raises PermissionDeniedError
        with self.assertRaises(PermissionDeniedError):
            enforcer.enforce_tenant_access('tenant-1', 'tenant-2', user_role='client_admin')

    def test_health_endpoint_resolver(self):
        url = _resolve_health_endpoint('/api/v1/health/')
        self.assertTrue(url.endswith('/api/v1/health/'))

    def test_backup_quota_update_and_threshold_alert(self):
        from apps.configs.models import BackupQuota
        quota = BackupQuota.objects.create(
            total_backup_storage_bytes=1000,
            used_backup_storage_bytes=0,
            warning_threshold_percent=80,
        )
        is_warning = quota.update_used_storage(850)
        self.assertTrue(is_warning)
        self.assertIsNotNone(quota.alert_sent_at)
        self.assertEqual(quota.used_backup_storage_bytes, 850)


