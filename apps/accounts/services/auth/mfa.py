import secrets
import pyotp
import logging
from typing import Optional, Tuple, Dict, Any, List
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from apps.accounts.models import User, MFADevice, MFABackupCode, MFAAuditLog
from apps.accounts.managers import MFADeviceManager, MFABackupCodeManager, MFAAuditLogManager
logger = logging.getLogger(__name__)

class MFAService:
    def __init__(self):
        self.issuer = settings.OTP_TOTP_ISSUER
        self.totp_digits = settings.OTP_TOTP_DIGITS
        self.totp_interval = settings.OTP_TOTP_INTERVAL

    def setup_totp(self, user: User, device_name: str = 'Authenticator') -> Dict[str, Any]:
        secret = pyotp.random_base32()
        device = MFADeviceManager.create_totp_device(
            user=user,
            name=device_name,
            secret=secret,
            is_primary=not user.mfa_devices.filter(is_active=True).exists(), # I think I'll get an error here
            tenant_id=user.tenant_id
        )
        backup_codes = MFABackupCodeManager.generate_codes(user)
        provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name=self.issuer
        )
        self.log_attempt(user, device, None, None, success=True, message='TOTP setup initiated')
        return {
            'secret': secret,
            'provisioning_uri': provisioning_uri,
            'qr_code_data': f"otpauth://totp/{self.issuer}:{user.email}?secret={secret}&issuer={self.issuer}",
            'backup_codes': [code.code for code in backup_codes],
            'device_id': str(device.id) 
        }
    
    def verify_otp(self, user: User, otp: str, device_id: str = None) -> Tuple[bool, Optional[MFADevice]]:
        devices = user.mfa_devices.filter(is_active=True, device_type='totp')
        if device_id:
            devices = devices.filter(id=device_id)
        for device in devices:
            totp = pyotp.TOTP(devices.secret, digest=self.totp_digits, interval=self.totp_interval)
            if totp.verify(otp, valid_window=1):
                if not device.is_verified:
                    device.verify()
                return True, device
        if self._verify_backup_code(user, otp):
            return True, user.mfa_devices.filter(deivce_type='backup').first()
        return False, None
    
    def _verify_backup_code(self, user: User, code: str) -> bool:
        try:
            backup_code = MFABackupCode.objects.get(
                user=user, code=code, is_used=False, expires_at__gt=timezone.now()
            )
            backup_code.use()
            return True
        except MFABackupCode.DoesNotExist:
            return False
        
    def disable_mfa(self, user: User, device_id: str = None) -> bool:
        try:
            if device_id:
                device = user.mfa_devices.filter(id=device_id).first()
                if device:
                    device.is_active = False
                    device.save(updated_fields=['is_active'])
            else:
                user.mfa_devices.filter(is_active=True).update(is_active=False)
            if not user.mfa_devices.filter(is_active=True).exists():
                user.disable_mfa()
            self.log_attempt(user, None, None, None, success=True, message='MFA disabled')
            return True
        except Exception as e:
            logger.error(f"MFA disable error for {user.email}: {str(e)}")
            return False
        
    def regenerate_backup_codes(self, user: User) -> List[str]:
        user.mfa_backup_codes.all().delete()
        backup_codes = MFABackupCode.generate_codes(user)
        self.log_attempt(user, None, None, None, success=True, message='Backup codes regenerated')
        return [code.code for code in backup_codes]
        
    def get_devices(self, user: User) -> List[Dict]:
        devices = []
        for device in user.mfa_devices.filter(is_deleted=False):
            devices.append({
                'id': str(device.id),
                'name': device.name,
                'device_type': device.device_type,
                'is_active': device.is_active,
                'is_primary': device.is_primary,
                'is_verified': device.is_verified,
                'last_used_at': device.last_used_at.isoformat() if device.last_used_at else None,
                'created_at': device.created_at.isoformat(),
            })
        return devices
    
    def get_backup_codes_remaining(self, user: User) -> int:
        return user.mfa_backup_codes.filter(is_used=False, expires_at__gt=timezone.now()).count()
    
    def set_primary_device(self, user: User, device_id: str) -> bool:
        try:
            from apps.accounts.models import MFADevice
            MFADevice.set_primary_device(user, device_id)
            return True
        except Exception as e:
            logger.error(f"Set primary device error: {str(e)}")
            return False
    
    def log_attempt(self, user: User, device: MFADevice, ip_address: str, user_agent: str, success: bool, message: str = '', **metadata):
        MFAAuditLog.log_attempt(
            user=user, device=device, ip_address=ip_address,
            user_agent=user_agent, success=success, message=message, **metadata
        )
    
    def get_failure_rate(self, user: User, hours: int = 24) -> float:
        return MFAAuditLog.get_failure_rate(user.id, hours)
