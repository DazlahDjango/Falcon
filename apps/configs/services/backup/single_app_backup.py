import json
import tempfile
import os
from django.core.management import call_command
from django.apps import apps
from django.db import connection
from apps.configs.services.backup.backup_strategy import BackupStrategyFactory
from apps.configs.services.backup.backup_compressor import BackupCompressor
from apps.configs.services.backup.backup_encryptor import BackupEncryptor
from apps.configs.services.backup.backup_storage import BackupStorage
from apps.configs.services.backup.backup_verification import BackupVerification
from apps.configs.services.security.integrity_verifier import IntegrityVerifier
from apps.configs.models import BackupPolicy
from apps.configs.exceptions import BackupError

class SingleAppBackup:
    def __init__(self):
        self.compressor = BackupCompressor()
        self.encryptor = BackupEncryptor()
        self.storage = BackupStorage()
        self.verifier = BackupVerification()
        self.integrity = IntegrityVerifier()
    def execute(self, app_name, backup_type):
        policy = BackupPolicy.objects.select_related('app').filter(app__name=app_name, status='enabled').first()
        if not policy:
            raise BackupError(f"No active backup policy for app {app_name}")
        strategy = BackupStrategyFactory.get_strategy(backup_type)
        if not strategy:
            raise BackupError(f"Unknown backup type {backup_type}")
        app_config = apps.get_app_config(app_name)
        with tempfile.NamedTemporaryFile(suffix='.json', mode='w', delete=False, encoding='utf-8') as tmp_file:
            call_command('dumpdata', app_name, indent=2, stdout=tmp_file)
            tmp_file_path = tmp_file.name
        with open(tmp_file_path, 'r', encoding='utf-8') as f:
            raw_data = f.read()
        compressed_data = self.compressor.compress(raw_data.encode(), policy.compression_algorithm if policy.compression_enabled else None)
        if policy.encryption_enabled:
            encrypted_data, key_id, iv = self.encryptor.encrypt(compressed_data)
        else:
            encrypted_data, key_id, iv = compressed_data, None, None
        checksum = self.integrity.calculate_checksum(encrypted_data)
        storage_path = self.storage.upload(encrypted_data, app_name, backup_type, checksum)
        self.verifier.verify(storage_path, checksum)
        os.unlink(tmp_file_path)
        return {
            'size_bytes': len(encrypted_data),
            'checksum': checksum,
            'storage_location': self.storage.get_storage_type(),
            'storage_path': storage_path,
            'encrypted_key_id': key_id,
            'iv': iv,
            'compression_algorithm': policy.compression_algorithm if policy.compression_enabled else None,
        }