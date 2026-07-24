# apps/reportplt/services/security/export_security.py
import os
import hashlib
import base64
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple, Any, Dict
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from apps.reportplt.exceptions import ReportExportError, ReportPermissionError

class EncryptionService:
    def __init__(self, key: Optional[bytes] = None):
        self.key = key or self._get_or_create_key()
        self.cipher = Fernet(self.key)

    def _get_or_create_key(self) -> bytes:
        from django.conf import settings
        key_env = getattr(settings, 'REPORT_ENCRYPTION_KEY', None)
        if key_env:
            return key_env.encode()
        key = Fernet.generate_key()
        return key

    def encrypt_data(self, data: bytes) -> bytes:
        try:
            return self.cipher.encrypt(data)
        except Exception as e:
            raise ReportExportError(f"Encryption failed: {str(e)}")

    def decrypt_data(self, encrypted_data: bytes) -> bytes:
        try:
            return self.cipher.decrypt(encrypted_data)
        except Exception as e:
            raise ReportExportError(f"Decryption failed: {str(e)}")

    def encrypt_file(self, file_path: str, output_path: Optional[str] = None) -> str:
        try:
            if not default_storage.exists(file_path):
                raise ReportExportError(f"File not found: {file_path}")
            with default_storage.open(file_path, 'rb') as f:
                data = f.read()
            encrypted = self.encrypt_data(data)
            if not output_path:
                output_path = f"{file_path}.encrypted"
            with default_storage.open(output_path, 'wb') as f:
                f.write(encrypted)
            return output_path
        except Exception as e:
            raise ReportExportError(f"File encryption failed: {str(e)}")

    def decrypt_file(self, file_path: str, output_path: Optional[str] = None) -> str:
        try:
            if not default_storage.exists(file_path):
                raise ReportExportError(f"File not found: {file_path}")
            with default_storage.open(file_path, 'rb') as f:
                data = f.read()
            decrypted = self.decrypt_data(data)
            if not output_path:
                output_path = file_path.replace('.encrypted', '.decrypted')
            with default_storage.open(output_path, 'wb') as f:
                f.write(decrypted)
            return output_path
        except Exception as e:
            raise ReportExportError(f"File decryption failed: {str(e)}")

    def encrypt_string(self, data: str) -> str:
        try:
            encrypted = self.cipher.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            raise ReportExportError(f"String encryption failed: {str(e)}")

    def decrypt_string(self, encrypted_data: str) -> str:
        try:
            decoded = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted = self.cipher.decrypt(decoded)
            return decrypted.decode()
        except Exception as e:
            raise ReportExportError(f"String decryption failed: {str(e)}")

class PasswordProtection:
    @staticmethod
    def generate_password(length: int = 16) -> str:
        alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    @staticmethod
    def hash_password(password: str, salt: Optional[bytes] = None) -> Tuple[str, str]:
        if not salt:
            salt = os.urandom(32)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key.decode(), base64.urlsafe_b64encode(salt).decode()

    @staticmethod
    def verify_password(password: str, hashed_key: str, salt_b64: str) -> bool:
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        try:
            kdf.derive(password.encode())
            return True
        except:
            return False

class ExportSecurity:
    def __init__(self):
        self.encryption_service = EncryptionService()
        self.password_protection = PasswordProtection()

    def secure_export(self, file_content: bytes, format: str, password: Optional[str] = None, encrypt: bool = False) -> Dict[str, Any]:
        result = {
            'content': file_content,
            'encrypted': False,
            'password_protected': False,
            'hash': None,
            'signature': None,
        }
        result['hash'] = self._generate_hash(file_content)
        result['signature'] = self._generate_signature(file_content)
        if encrypt:
            result['content'] = self.encryption_service.encrypt_data(file_content)
            result['encrypted'] = True
        if password:
            result['content'] = self._protect_with_password(file_content, password)
            result['password_protected'] = True
        return result

    def _generate_hash(self, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def _generate_signature(self, data: bytes) -> str:
        import hmac
        secret = os.environ.get('REPORT_SIGNING_SECRET', 'default-secret-key').encode()
        return hmac.new(secret, data, hashlib.sha256).hexdigest()

    def _protect_with_password(self, data: bytes, password: str) -> bytes:
        from cryptography.fernet import Fernet
        salt = os.urandom(32)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        cipher = Fernet(key)
        encrypted = cipher.encrypt(data)
        return salt + encrypted

    def verify_export(self, file_path: str, expected_hash: Optional[str] = None) -> bool:
        try:
            with default_storage.open(file_path, 'rb') as f:
                data = f.read()
            current_hash = self._generate_hash(data)
            if expected_hash and current_hash != expected_hash:
                return False
            return True
        except Exception:
            return False

    def generate_download_token(self, export_id: str, user_id: str, expires_in: int = 3600) -> str:
        timestamp = int(timezone.now().timestamp())
        data = f"{export_id}:{user_id}:{timestamp}:{expires_in}"
        signature = self._generate_signature(data.encode())
        token = base64.urlsafe_b64encode(f"{data}:{signature}".encode()).decode()
        return token

    def verify_download_token(self, token: str) -> Tuple[str, str, bool]:
        try:
            decoded = base64.urlsafe_b64decode(token.encode()).decode()
            parts = decoded.split(':')
            if len(parts) != 5:
                return None, None, False
            export_id, user_id, timestamp_str, expires_in, signature = parts
            timestamp = int(timestamp_str)
            expires_in = int(expires_in)
            if timezone.now().timestamp() > timestamp + expires_in:
                return None, None, False
            data = f"{export_id}:{user_id}:{timestamp_str}:{expires_in}"
            expected = self._generate_signature(data.encode())
            if signature != expected:
                return None, None, False
            return export_id, user_id, True
        except Exception:
            return None, None, False

    def secure_file_name(self, original_name: str) -> str:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        random_suffix = secrets.token_hex(8)
        name, ext = os.path.splitext(original_name)
        return f"{name}_{timestamp}_{random_suffix}{ext}"

    def sanitize_file_name(self, file_name: str) -> str:
        import re
        file_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', file_name)
        file_name = file_name.strip()
        if not file_name:
            file_name = 'report'
        return file_name

    def get_secure_path(self, tenant_id: str, report_id: str, file_name: str) -> str:
        safe_name = self.sanitize_file_name(file_name)
        return f"reports/{tenant_id}/{report_id}/{safe_name}"

    def validate_password(self, password: str, min_length: int = 6) -> bool:
        if len(password) < min_length:
            return False
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        return has_upper and has_lower and has_digit

    def enforce_export_policy(self, user, report, format: str, size: int) -> None:
        from apps.reportplt.constants import MAX_EXPORT_SIZE, MAX_ROWS_PER_EXPORT
        if size > MAX_EXPORT_SIZE:
            raise ReportPermissionError(f"Export size exceeds limit of {MAX_EXPORT_SIZE / (1024*1024)}MB")
        if format == 'pdf' and not user.can_validate_entries and user.role != 'executive':
            raise ReportPermissionError("Insufficient permissions for PDF export")
        if format in ['excel', 'csv'] and not user.can_validate_entries and user.role not in ['executive', 'client_admin']:
            raise ReportPermissionError("Insufficient permissions for data export")
        if report.owner_id != user.id and not user.can_validate_entries and user.role not in ['executive', 'client_admin']:
            raise ReportPermissionError("Cannot export reports owned by others")

    def sign_export_data(self, data: Dict) -> Dict:
        import json
        content = json.dumps(data, sort_keys=True).encode()
        signature = self._generate_signature(content)
        data['_signature'] = signature
        data['_timestamp'] = timezone.now().isoformat()
        return data

    def verify_export_data(self, data: Dict) -> bool:
        import json
        if '_signature' not in data or '_timestamp' not in data:
            return False
        signature = data.pop('_signature')
        timestamp = data.pop('_timestamp')
        content = json.dumps(data, sort_keys=True).encode()
        expected = self._generate_signature(content)
        if signature != expected:
            return False
        timestamp_dt = datetime.fromisoformat(timestamp)
        if timezone.now() - timestamp_dt > timedelta(hours=24):
            return False
        return True