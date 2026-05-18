from apps.configs.services.registry.recovery_order import RecoveryOrder
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.models import BackupJob
from apps.configs.exceptions import RestoreError

class FullSystemRestore:
    def __init__(self):
        self.recovery_order = RecoveryOrder()
        self.single_restore = SingleAppRestore()
    def execute(self, backup_timestamp):
        recovery_sequence = self.recovery_order.get_recovery_sequence()
        results = []
        errors = []
        for app in recovery_sequence:
            latest_backup = BackupJob.objects.filter(
                app=app,
                status='completed',
                backup_type='full',
                completed_at__lte=backup_timestamp
            ).order_by('-completed_at').first()
            if not latest_backup:
                errors.append({'app': app.name, 'error': 'No full backup found'})
                continue
            try:
                result = self.single_restore.execute(app.name, latest_backup.id)
                results.append(result)
            except Exception as e:
                errors.append({'app': app.name, 'error': str(e)})
                raise RestoreError(f"Full system restore failed at {app.name}: {str(e)}")
        return {'results': results, 'errors': errors, 'success': len(errors) == 0}