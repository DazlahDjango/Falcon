import os
import base64
import hashlib

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from django.conf import settings
from django.utils import timezone
from apps.configs.exceptions import EncryptionError, KeyNotFoundError
from apps.configs.models import EncryptionKey

class BackupEncryptionService:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def _get_active_key(self):
        key = EncryptionKey.objects.filter(key_status='active', is_default=True).first()
        if not key:
            raise KeyNotFoundError("No active default encryption key found")
        return key
    def encrypt_backup(self, data_bytes, key_id=None):
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        import secrets
        if key_id:
            key_obj = EncryptionKey.objects.filter(key_id=key_id, key_status='active').first()
            if not key_obj:
                raise KeyNotFoundError(f"Encryption key {key_id} not found or inactive")
        else:
            key_obj = self._get_active_key()
        key_material = hashlib.sha256(key_obj.key_alias.encode()).digest()
        iv = secrets.token_bytes(12)
        cipher = Cipher(algorithms.AES(key_material), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(data_bytes) + encryptor.finalize()
        result = iv + encryptor.tag + ciphertext
        key_obj.usage_count += 1
        key_obj.last_used_at = timezone.now()
        key_obj.save(update_fields=['usage_count', 'last_used_at'])
        return result, key_obj.key_id, base64.b64encode(iv).decode()
    def decrypt_backup(self, encrypted_bytes, key_id, iv_b64):
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        key_obj = EncryptionKey.objects.filter(key_id=key_id).first()
        if not key_obj:
            raise KeyNotFoundError(f"Encryption key {key_id} not found")
        if key_obj.key_status == 'compromised':
            raise EncryptionError(f"Key {key_id} is compromised, cannot decrypt")
        key_material = hashlib.sha256(key_obj.key_alias.encode()).digest()
        iv = base64.b64decode(iv_b64)
        tag = encrypted_bytes[-16:]
        ciphertext = encrypted_bytes[:-16]
        cipher = Cipher(algorithms.AES(key_material), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        return decryptor.update(ciphertext) + decryptor.finalize()