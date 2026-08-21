from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import secrets
import base64
import hashlib
import logging
from django.conf import settings
from apps.configs.exceptions import EncryptionError

logger = logging.getLogger(__name__)

class BackupEncryptor:
    def __init__(self, master_key=None):
        self.master_key = master_key or getattr(settings, 'SECRET_KEY', 'default_secret_key_32bytes_min!').encode()[:32]
    
    def encrypt(self, data):
        if not data:
            return data, None, None
        try:
            from apps.configs.services.security.backup_encryption_service import BackupEncryptionService
            return BackupEncryptionService().encrypt_backup(data)
        except Exception as e:
            logger.debug(f"BackupEncryptionService unavailable or unseeded, falling back to master key encryption: {e}")
            key_material = hashlib.sha256(self.master_key).digest()
            iv = secrets.token_bytes(12)
            cipher = Cipher(algorithms.AES(key_material), modes.GCM(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(data) + encryptor.finalize()
            result = iv + encryptor.tag + ciphertext
            key_id = "master_key_v1"
            iv_b64 = base64.b64encode(iv).decode()
            return result, key_id, iv_b64

    def decrypt(self, encrypted_data, key_id, iv_b64):
        if not encrypted_data:
            return encrypted_data
        if key_id and key_id != "master_key_v1":
            try:
                from apps.configs.services.security.backup_encryption_service import BackupEncryptionService
                return BackupEncryptionService().decrypt_backup(encrypted_data, key_id, iv_b64)
            except Exception as e:
                logger.warning(f"BackupEncryptionService decrypt failed for key_id {key_id}: {e}")
        
        key_material = hashlib.sha256(self.master_key).digest()
        iv = encrypted_data[:12]
        tag = encrypted_data[12:28]
        ciphertext = encrypted_data[28:]
        cipher = Cipher(algorithms.AES(key_material), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        return decryptor.update(ciphertext) + decryptor.finalize()