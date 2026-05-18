import hashlib
import json
from django.utils import timezone
from apps.configs.exceptions import ValidationError

class IntegrityVerifier:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def calculate_checksum(self, data):
        if isinstance(data, bytes):
            return hashlib.sha256(data).hexdigest()
        elif isinstance(data, str):
            return hashlib.sha256(data.encode()).hexdigest()
        elif isinstance(data, dict):
            return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
        else:
            return hashlib.sha256(str(data).encode()).hexdigest()
    def verify_backup_integrity(self, backup_data, expected_checksum):
        actual_checksum = self.calculate_checksum(backup_data)
        if actual_checksum != expected_checksum:
            raise ValidationError(f"Integrity check failed. Expected {expected_checksum}, got {actual_checksum}")
        return True
    def verify_restored_data(self, original_checksum, restored_data):
        restored_checksum = self.calculate_checksum(restored_data)
        if original_checksum != restored_checksum:
            raise ValidationError(f"Restored data integrity check failed")
        return True
    def generate_manifest(self, backup_job_id, artifacts):
        manifest = {
            'backup_job_id': str(backup_job_id),
            'artifacts': artifacts,
            'timestamp': timezone.now().isoformat(),
            'checksum': None
        }
        manifest['checksum'] = self.calculate_checksum(manifest)
        return manifest