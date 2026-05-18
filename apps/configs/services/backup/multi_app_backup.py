from django.db import transaction
from apps.configs.services.registry.recovery_order import RecoveryOrder
from apps.configs.services.backup.single_app_backup import SingleAppBackup
from apps.configs.exceptions import BackupError

class MultiAppBackup:
    def __init__(self):
        self.recovery_order = RecoveryOrder()
        self.single_backup = SingleAppBackup()
    def execute(self, app_names=None, backup_type='full'):
        if app_names:
            sequence = self.recovery_order.get_recovery_sequence(app_names)
        else:
            sequence = self.recovery_order.get_recovery_sequence()
        results = {}
        errors = []
        for app in sequence:
            try:
                result = self.single_backup.execute(app.name, backup_type)
                results[app.name] = result
            except Exception as e:
                errors.append({'app': app.name, 'error': str(e)})
                if backup_type == 'full':
                    raise BackupError(f"Multi-app backup failed at {app.name}: {str(e)}")
        return {'results': results, 'errors': errors, 'success': len(errors) == 0}
    def execute_parallel(self, app_names, backup_type='full', max_workers=4):
        from concurrent.futures import ThreadPoolExecutor, as_completed
        results = {}
        errors = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(self.single_backup.execute, app_name, backup_type): app_name for app_name in app_names}
            for future in as_completed(futures):
                app_name = futures[future]
                try:
                    results[app_name] = future.result()
                except Exception as e:
                    errors.append({'app': app_name, 'error': str(e)})
        return {'results': results, 'errors': errors, 'success': len(errors) == 0}