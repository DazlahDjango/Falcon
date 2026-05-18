import hashlib
from django.utils import timezone
from apps.configs.services.backup.backup_storage import BackupStorage
from apps.configs.exceptions import BackupCorruptError

class BackupVerification:
    def __init__(self):
        self.storage = BackupStorage()
    def verify(self, storage_path, expected_checksum):
        data = self.storage.download(storage_path)
        actual_checksum = hashlib.sha256(data).hexdigest()
        if actual_checksum != expected_checksum:
            raise BackupCorruptError(f"Checksum mismatch. Expected {expected_checksum}, got {actual_checksum}")
        return True
    def verify_and_update_status(self, artifact_id):
        from apps.configs.models import BackupArtifact
        artifact = BackupArtifact.objects.select_related('backup_job').get(id=artifact_id)
        try:
            self.verify(artifact.storage_path, artifact.backup_job.checksum)
            artifact.status = 'verified'
            artifact.verified_at = timezone.now()
            artifact.save(update_fields=['status', 'verified_at'])
            return True
        except BackupCorruptError as e:
            artifact.status = 'corrupt'
            artifact.save(update_fields=['status'])
            raise e