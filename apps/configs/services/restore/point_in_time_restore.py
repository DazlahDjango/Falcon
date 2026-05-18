from django.utils import timezone
from apps.configs.models import BackupJob
from apps.configs.services.restore.single_app_restore import SingleAppRestore
from apps.configs.exceptions import RestoreError

class PointInTimeRestore:
    def __init__(self):
        self.single_restore = SingleAppRestore()
    def execute(self, app_name, target_time):
        full_backup = BackupJob.objects.filter(
            app__name=app_name,
            status='completed',
            backup_type='full',
            completed_at__lte=target_time
        ).order_by('-completed_at').first()
        if not full_backup:
            raise RestoreError(f"No full backup found before {target_time} for app {app_name}")
        self.single_restore.execute(app_name, full_backup.id)
        incrementals = BackupJob.objects.filter(
            app__name=app_name,
            status='completed',
            backup_type='incremental',
            completed_at__gt=full_backup.completed_at,
            completed_at__lte=target_time
        ).order_by('completed_at')
        for inc in incrementals:
            self.single_restore.execute(app_name, inc.id)
        return {'app': app_name, 'restored_to': target_time.isoformat(), 'full_backup_id': str(full_backup.id), 'incrementals_applied': incrementals.count()}