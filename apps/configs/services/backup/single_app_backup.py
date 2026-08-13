import io
import json
import logging
from django.core.management import call_command
from django.apps import apps
from django.db import connection, transaction
from apps.configs.services.backup.backup_strategy import BackupStrategyFactory
from apps.configs.services.backup.backup_compressor import BackupCompressor
from apps.configs.services.backup.backup_encryptor import BackupEncryptor
from apps.configs.services.backup.backup_storage import BackupStorage
from apps.configs.services.backup.backup_verification import BackupVerification
from apps.configs.services.backup.database_dump_service import DatabaseDumpService
from apps.configs.services.security.integrity_verifier import IntegrityVerifier
from apps.configs.models import BackupPolicy, RegisteredApp
from apps.configs.exceptions import BackupError

logger = logging.getLogger(__name__)

class SingleAppBackup:
    def __init__(self):
        self.compressor = BackupCompressor()
        self.encryptor = BackupEncryptor()
        self.storage = BackupStorage()
        self.verifier = BackupVerification()
        self.integrity = IntegrityVerifier()
        self.db_dump_service = DatabaseDumpService()

    def execute(self, app_name, backup_type):
        policy = BackupPolicy.objects.select_related('app').filter(app__name=app_name, status='enabled').first()
        if not policy:
            raise BackupError(f"No active backup policy for app {app_name}")
        strategy = BackupStrategyFactory.get_strategy(backup_type)
        if not strategy:
            raise BackupError(f"Unknown backup type {backup_type}")

        registered_app = policy.app
        raw_bytes = None
        dump_format = 'json'

        # High-Performance Path: Try pg_dump if database table is specified and pg_dump is available
        if self.db_dump_service.is_pg_dump_available() and registered_app.database_table_name:
            raw_bytes = self.db_dump_service.dump_app_table(registered_app.database_table_name)
            if raw_bytes:
                dump_format = 'pg_custom'

        # Fallback In-Memory Path: Use dumpdata streamed into memory StringIO (no unencrypted disk exposure)
        if raw_bytes is None:
            buffer = io.StringIO()
            try:
                with transaction.atomic():
                    call_command('dumpdata', app_name, indent=2, stdout=buffer)
                raw_bytes = buffer.getvalue().encode('utf-8')
                dump_format = 'json'
            except Exception as e:
                raise BackupError(f"Failed to extract data for app {app_name}: {str(e)}")
            finally:
                buffer.close()

        # In-memory compression & encryption pipeline
        compressed_data = self.compressor.compress(
            raw_bytes,
            policy.compression_algorithm if policy.compression_enabled else None
        )
        
        if policy.encryption_enabled:
            encrypted_data, key_id, iv = self.encryptor.encrypt(compressed_data)
        else:
            encrypted_data, key_id, iv = compressed_data, None, None

        checksum = self.integrity.calculate_checksum(encrypted_data)
        storage_path = self.storage.upload(encrypted_data, app_name, backup_type, checksum)
        self.verifier.verify(storage_path, checksum)

        return {
            'size_bytes': len(encrypted_data),
            'checksum': checksum,
            'storage_location': self.storage.get_storage_type(),
            'storage_path': storage_path,
            'encrypted_key_id': key_id,
            'iv': iv,
            'compression_algorithm': policy.compression_algorithm if policy.compression_enabled else None,
            'dump_format': dump_format,
        }