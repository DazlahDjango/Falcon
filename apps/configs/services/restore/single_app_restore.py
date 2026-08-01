import tempfile
import os
import logging
from django.core.management import call_command
from django.db import connection
from django.utils import timezone
from apps.configs.services.backup.backup_storage import BackupStorage
from apps.configs.services.backup.backup_encryptor import BackupEncryptor
from apps.configs.services.backup.backup_compressor import BackupCompressor
from apps.configs.services.backup.database_dump_service import DatabaseDumpService
from apps.configs.services.security.integrity_verifier import IntegrityVerifier
from apps.configs.models import BackupJob, BackupArtifact, BackupPolicy
from apps.configs.exceptions import RestoreError, RestoreValidationError

logger = logging.getLogger(__name__)

class SingleAppRestore:
    def __init__(self):
        self.storage = BackupStorage()
        self.encryptor = BackupEncryptor()
        self.compressor = BackupCompressor()
        self.integrity = IntegrityVerifier()
        self.db_dump_service = DatabaseDumpService()

    def execute(self, app_name, backup_job_id):
        backup_job = BackupJob.objects.select_related('app').get(id=backup_job_id)
        artifact = BackupArtifact.objects.filter(backup_job=backup_job).first()
        if not artifact:
            raise RestoreError(f"No artifact found for backup job {backup_job_id}")

        encrypted_data = self.storage.download(artifact.storage_path)
        self.integrity.verify_backup_integrity(encrypted_data, backup_job.checksum)

        if artifact.encrypted_key_id:
            decrypted_data = self.encryptor.decrypt(encrypted_data, artifact.encrypted_key_id, artifact.iv_initialization_vector)
        else:
            decrypted_data = encrypted_data

        # Decompress data if compression was used
        compression_algorithm = backup_job.metadata.get('compression_algorithm')
        if compression_algorithm:
            decrypted_data = self.compressor.decompress(decrypted_data, compression_algorithm)

        dump_format = backup_job.metadata.get('dump_format')
        is_pg_custom = dump_format == 'pg_custom' or decrypted_data.startswith(b'PGDMP')

        if is_pg_custom and self.db_dump_service.is_pg_restore_available():
            success = self.db_dump_service.restore_app_table(decrypted_data)
            if not success:
                raise RestoreError(f"Failed to restore PostgreSQL table dump for app {app_name}")
        else:
            # Fallback for JSON fixture restoration via loaddata
            tmp_file_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix='.json', mode='wb', delete=False) as tmp_file:
                    tmp_file.write(decrypted_data)
                    tmp_file_path = tmp_file.name
                call_command('loaddata', tmp_file_path, app=app_name)
            except Exception as e:
                raise RestoreError(f"Failed to load data for app {app_name}: {str(e)}")
            finally:
                if tmp_file_path and os.path.exists(tmp_file_path):
                    try:
                        os.unlink(tmp_file_path)
                    except OSError as e:
                        logger.warning(f"Failed to unlink temp restore file {tmp_file_path}: {e}")

        artifact.restored_at = timezone.now()
        artifact.restore_count += 1
        artifact.save(update_fields=['restored_at', 'restore_count'])
        return {'app': app_name, 'backup_job_id': str(backup_job_id), 'status': 'success'}