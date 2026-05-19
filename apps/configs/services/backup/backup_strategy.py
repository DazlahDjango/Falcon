from abc import ABC, abstractmethod
from django.utils import timezone
from datetime import timedelta
from apps.configs.constants import BackupType
from apps.configs.exceptions import BackupError

class BackupStrategy(ABC):
    @abstractmethod
    def execute(self, app_name, base_backup_id=None):
        pass
    @abstractmethod
    def get_last_backup(self, app_name):
        pass

class FullBackupStrategy(BackupStrategy):
    def execute(self, app_name, base_backup_id=None):
        return {'type': 'full', 'app': app_name, 'timestamp': timezone.now().isoformat()}
    def get_last_backup(self, app_name):
        from apps.configs.models import BackupJob
        return BackupJob.objects.filter(app__name=app_name, backup_type='full', status='completed').order_by('-completed_at').first()

class IncrementalBackupStrategy(BackupStrategy):
    def execute(self, app_name, base_backup_id=None):
        return {'type': 'incremental', 'app': app_name, 'base_backup_id': base_backup_id, 'timestamp': timezone.now().isoformat()}
    def get_last_backup(self, app_name):
        from apps.configs.models import BackupJob
        return BackupJob.objects.filter(app__name=app_name, status='completed').order_by('-completed_at').first()

class DifferentialBackupStrategy(BackupStrategy):
    def execute(self, app_name, base_backup_id=None):
        return {'type': 'differential', 'app': app_name, 'base_backup_id': base_backup_id, 'timestamp': timezone.now().isoformat()}
    def get_last_backup(self, app_name):
        from apps.configs.models import BackupJob
        return BackupJob.objects.filter(app__name=app_name, backup_type='full', status='completed').order_by('-completed_at').first()

class SyntheticBackupStrategy(BackupStrategy):
    def execute(self, app_name, base_backup_id=None):
        return {'type': 'synthetic', 'app': app_name, 'timestamp': timezone.now().isoformat()}
    def get_last_backup(self, app_name):
        from apps.configs.models import BackupJob
        return BackupJob.objects.filter(app__name=app_name, backup_type='full', status='completed').order_by('-completed_at').first()

class CDPBackupStrategy(BackupStrategy):
    def execute(self, app_name, base_backup_id=None):
        return {'type': 'cdp', 'app': app_name, 'continuous': True, 'timestamp': timezone.now().isoformat()}
    def get_last_backup(self, app_name):
        from apps.configs.models import BackupJob
        return BackupJob.objects.filter(app__name=app_name, status='completed').order_by('-completed_at').first()

class BackupStrategyFactory:
    @staticmethod
    def get_strategy(backup_type):
        strategies = {
            BackupType.FULL: FullBackupStrategy(),
            BackupType.INCREMENTAL: IncrementalBackupStrategy(),
            BackupType.DIFFERENTIAL: DifferentialBackupStrategy(),
            BackupType.SYNTHETIC: SyntheticBackupStrategy(),
            BackupType.CDP: CDPBackupStrategy(),
        }
        return strategies.get(backup_type)