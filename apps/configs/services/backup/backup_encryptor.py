from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import secrets
import base64
import hashlib
from django.conf import settings
from apps.configs.exceptions import EncryptionError

class BackupEncryptor:
    def __init__(self, master_key=None):
        self.master_key = master_key or settings.SECRET_KEY[:32].encode()
    def encrypt(self, data):
        if not data:
            return data, None, None
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
        key_material = hashlib.sha256(self.master_key).digest()
        # The encrypt method prepends iv (12 bytes) and tag (16 bytes)
        iv = encrypted_data[:12]
        tag = encrypted_data[12:28]
        ciphertext = encrypted_data[28:]
        cipher = Cipher(algorithms.AES(key_material), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        return decryptor.update(ciphertext) + decryptor.finalize()