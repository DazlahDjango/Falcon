import pyotp
import logging
from typing import Optional, Tuple, Dict, Any, List
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from datetime import timedelta
from apps.accounts.models import User, MFADevice, MFABackupCode, MFAAuditLog

logger = logging.getLogger(__name__)


class MFAService:
    def __init__(self):
        self.issuer = getattr(settings, 'OTP_TOTP_ISSUER', 'FalconPMS')
        self.totp_digits = getattr(settings, 'OTP_TOTP_DIGITS', 6)
        self.totp_interval = getattr(settings, 'OTP_TOTP_INTERVAL', 30)
        self.max_failures = getattr(settings, 'MFA_MAX_FAILURES', 5)
        self.lockout_minutes = getattr(settings, 'MFA_LOCKOUT_MINUTES', 15)
    
    def setup_totp(self, user: User, device_name: str = 'Authenticator', ip_address: str = None, user_agent: str = None) -> Dict[str, Any]:
        try:
            with transaction.atomic():
                secret = pyotp.random_base32()
                has_existing_devices = user.auth_devices.filter(is_active=True).exists()
                device = MFADevice.objects.create_totp_device(
                    user=user,
                    name=device_name,
                    secret=secret,
                    is_primary=not has_existing_devices,
                )
                raw_codes, _ = MFABackupCode.objects.generate_codes(user)
                totp = pyotp.TOTP(secret, digits=self.totp_digits, interval=self.totp_interval)
                provisioning_uri = totp.provisioning_uri(
                    name=user.email,
                    issuer_name=self.issuer
                )
                MFAAuditLog.objects.log_enroll(
                    user=user,
                    device=device,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    device_name=device_name
                )
                logger.info(f"MFA setup initiated for user {user.email}")
                return {
                    'secret': secret,
                    'provisioning_uri': provisioning_uri,
                    'qr_code_data': f"otpauth://totp/{self.issuer}:{user.email}?secret={secret}&issuer={self.issuer}&digits={self.totp_digits}&period={self.totp_interval}",
                    'backup_codes': raw_codes,
                    'device_id': str(device.id),
                    'device_name': device.name
                }
        except Exception as e:
            logger.error(f"TOTP setup failed for user {user.email}: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to setup MFA: {str(e)}")
    
    def verify_otp(self, user: User, otp: str, device_id: str = None, ip_address: str = None, user_agent: str = None) -> Tuple[bool, Optional[MFADevice], str]:
        if self._is_rate_limited(user, ip_address):
            message = "Too many failed attempts. Please try again later."
            MFAAuditLog.objects.log_attempt(
                user=user, device=None, ip_address=ip_address, user_agent=user_agent,
                success=False, message=message
            )
            return False, None, message
        devices_query = user.auth_devices.filter(is_active=True, device_type='totp')
        if device_id:
            devices_query = devices_query.filter(id=device_id)
        for device in devices_query:
            if device.is_locked():
                message = f"Device '{device.name}' is locked. Try again later."
                return False, device, message
            try:
                secret = device.secret
                if not secret:
                    continue
                totp = pyotp.TOTP(secret, digits=self.totp_digits, interval=self.totp_interval)
                if totp.verify(otp, valid_window=1):
                    device.reset_fail_count()
                    if not device.is_verified:
                        device.verify()
                    device.mark_used()
                    MFAAuditLog.objects.log_attempt(
                        user=user, device=device, ip_address=ip_address, user_agent=user_agent,
                        success=True, message='OTP verified successfully', device_name=device.name
                    )
                    logger.info(f"OTP verified for user {user.email} using device {device.name}")
                    return True, device, "OTP verified successfully"
                else:
                    device.increment_fail_count()
            except Exception as e:
                logger.error(f"TOTP verification error for device {device.id}: {e}")
                continue
        is_valid_backup, backup_code = self._verify_backup_code(user, otp)
        if is_valid_backup:
            MFAAuditLog.objects.log_attempt(
                user=user, device=None, ip_address=ip_address, user_agent=user_agent,
                success=True, message='Backup code used successfully'
            )
            return True, None, "Backup code verified successfully"
        self._increment_rate_limit(user, ip_address)
        message = "Invalid OTP or backup code"
        MFAAuditLog.objects.log_attempt(
            user=user, device=None, ip_address=ip_address, user_agent=user_agent,
            success=False, message=message
        )
        return False, None, message
    
    def _verify_backup_code(self, user: User, code: str) -> Tuple[bool, Optional[MFABackupCode]]:
        try:
            return MFABackupCode.objects.verify_code(user, code)
        except Exception as e:
            logger.error(f"Backup code verification error for user {user.email}: {e}")
            return False, None
    
    def _is_rate_limited(self, user: User, ip_address: str = None) -> bool:
        cache_key_user = f"mfa_rate_limit_user_{user.id}"
        user_attempts = cache.get(cache_key_user, 0)
        if ip_address:
            cache_key_ip = f"mfa_rate_limit_ip_{ip_address}"
            ip_attempts = cache.get(cache_key_ip, 0)
        else:
            ip_attempts = 0
        max_attempts = getattr(settings, 'MFA_RATE_LIMIT_ATTEMPTS', 10)
        return user_attempts >= max_attempts or ip_attempts >= max_attempts
    
    def _increment_rate_limit(self, user: User, ip_address: str = None):
        cache_key_user = f"mfa_rate_limit_user_{user.id}"
        user_attempts = cache.get(cache_key_user, 0)
        cache.set(cache_key_user, user_attempts + 1, 300)
        if ip_address:
            cache_key_ip = f"mfa_rate_limit_ip_{ip_address}"
            ip_attempts = cache.get(cache_key_ip, 0)
            cache.set(cache_key_ip, ip_attempts + 1, 300)
    
    def disable_mfa(self, user: User, device_id: str = None, ip_address: str = None, user_agent: str = None) -> bool:
        try:
            with transaction.atomic():
                if device_id:
                    device = user.auth_devices.filter(id=device_id).first()
                    if device:
                        device.is_active = False
                        device.save(update_fields=['is_active'])
                        MFAAuditLog.objects.log_disable(
                            user=user, device=device, ip_address=ip_address, user_agent=user_agent
                        )
                    else:
                        return False
                else:
                    count = user.auth_devices.filter(is_active=True).update(is_active=False)
                    logger.info(f"Disabled {count} MFA devices for user {user.email}")
                return True
        except Exception as e:
            logger.error(f"MFA disable error for {user.email}: {e}", exc_info=True)
            return False
    
    def set_primary_device(self, user: User, device_id: str) -> bool:
        try:
            with transaction.atomic():
                device = user.auth_devices.filter(id=device_id, is_active=True).first()
                if not device:
                    return False
                MFADevice.objects.set_primary_device(user, device_id)
                return True
        except Exception as e:
            logger.error(f"Set primary device error: {e}", exc_info=True)
            return False
    
    def regenerate_backup_codes(self, user: User, ip_address: str = None, user_agent: str = None) -> Tuple[List[str], int]:
        try:
            with transaction.atomic():
                raw_codes, _ = MFABackupCode.objects.generate_codes(user)
                MFAAuditLog.objects.log_attempt(
                    user=user, device=None, ip_address=ip_address, user_agent=user_agent,
                    success=True, message=f'Backup codes regenerated ({len(raw_codes)} codes)'
                )
                return raw_codes, len(raw_codes)
        except Exception as e:
            logger.error(f"Backup code regeneration failed for {user.email}: {e}", exc_info=True)
            raise ValueError(f"Failed to regenerate backup codes: {str(e)}")
    
    def get_backup_codes_remaining(self, user: User) -> int:
        return MFABackupCode.objects.get_valid_codes(user)
    
    def get_devices(self, user: User) -> List[Dict[str, Any]]:
        devices = []
        for device in user.auth_devices.filter(is_deleted=False):
            devices.append({
                'id': str(device.id),
                'name': device.name,
                'device_type': device.device_type,
                'device_type_display': device.get_device_type_display(),
                'is_active': device.is_active,
                'is_primary': device.is_primary,
                'is_verified': device.is_verified,
                'is_locked': device.is_locked(),
                'verified_at': device.verified_at.isoformat() if device.verified_at else None,
                'last_used_at': device.last_used_at.isoformat() if device.last_used_at else None,
                'fail_count': device.fail_count,
                'created_at': device.created_at.isoformat(),
            })
        return devices
    
    def get_device(self, user: User, device_id: str) -> Optional[Dict[str, Any]]:
        device = user.auth_devices.filter(id=device_id, is_deleted=False).first()
        if not device:
            return None
        return {
            'id': str(device.id),
            'name': device.name,
            'device_type': device.device_type,
            'device_type_display': device.get_device_type_display(),
            'phone': device.phone if device.device_type == 'sms' else None,
            'email': device.email if device.device_type == 'email' else None,
            'is_active': device.is_active,
            'is_primary': device.is_primary,
            'is_verified': device.is_verified,
            'is_locked': device.is_locked(),
            'verified_at': device.verified_at.isoformat() if device.verified_at else None,
            'last_used_at': device.last_used_at.isoformat() if device.last_used_at else None,
            'fail_count': device.fail_count,
            'locked_until': device.locked_until.isoformat() if device.locked_until else None,
            'device_info': device.device_info,
            'created_at': device.created_at.isoformat(),
        }
    
    def is_mfa_enabled(self, user: User) -> bool:
        return user.auth_devices.filter(is_active=True, is_verified=True).exists()
    
    def get_mfa_status(self, user: User) -> Dict[str, Any]:
        active_devices = user.auth_devices.filter(is_active=True)
        verified_devices = active_devices.filter(is_verified=True)
        primary_device = verified_devices.filter(is_primary=True).first()
        return {
            'enabled': self.is_mfa_enabled(user),
            'has_active_devices': active_devices.exists(),
            'active_devices_count': active_devices.count(),
            'verified_devices_count': verified_devices.count(),
            'primary_device': self.get_device(user, str(primary_device.id)) if primary_device else None,
            'backup_codes_remaining': self.get_backup_codes_remaining(user),
            'requires_mfa': self.is_mfa_enabled(user) or user.mfa_required is True,
        }
    
    def get_recent_activity(self, user: User, hours: int = 24) -> List[Dict]:
        cutoff = timezone.now() - timedelta(hours=hours)
        logs = MFAAuditLog.objects.filter(user=user, created_at__gte=cutoff).order_by('-created_at')[:50]
        return [
            {
                'event_type': log.event_type,
                'success': log.success,
                'message': log.message,
                'ip_address': log.ip_address,
                'created_at': log.created_at.isoformat(),
                'device_name': log.device.name if log.device else None
            }
            for log in logs
        ]

    def generate_totp_secret(self) -> str:
        return pyotp.random_base32()
    
    def get_current_otp(self, secret: str) -> str:
        totp = pyotp.TOTP(secret, digits=self.totp_digits, interval=self.totp_interval)
        return totp.now()
    
    def verify_totp_secret(self, secret: str, otp: str) -> bool:
        totp = pyotp.TOTP(secret, digits=self.totp_digits, interval=self.totp_interval)
        return totp.verify(otp, valid_window=1)

    def recover_account(self, user: User, recovery_code: str, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str]:
        try:
            with transaction.atomic():
                success, backup_code = MFABackupCode.objects.verify_code(user, recovery_code)
                if not success:
                    self._increment_rate_limit(user, ip_address)
                    self._log_recovery_attempt(user, False, ip_address, user_agent, 'Invalid backup code')
                    return False, "Invalid recovery code"
                self._log_recovery_attempt(user, True, ip_address, user_agent, 'Account recovered via backup code')
                logger.info(f"Account recovery successful for {user.email}")
                return True, "Account recovered successfully. Please set up new MFA devices."
        except Exception as e:
            logger.error(f"Recovery failed for {user.email}: {e}", exc_info=True)
            return False, f"Recovery failed: {str(e)}"

    def generate_new_recovery_codes(self, user: User, ip_address: str = None, user_agent: str = None) -> Dict[str, Any]:
        try:
            with transaction.atomic():
                MFABackupCode.objects.filter(user=user).delete()
                raw_codes, _ = MFABackupCode.objects.generate_codes(user)
                self._log_recovery_attempt(user, True, ip_address, user_agent, f'Generated {len(raw_codes)} new recovery codes')
                return {
                    'codes': raw_codes,
                    'count': len(raw_codes),
                    'message': 'Save these codes in a secure location. Each code can only be used once.'
                }
        except Exception as e:
            logger.error(f"Failed to generate recovery codes for {user.email}: {e}", exc_info=True)
            raise ValueError(f"Failed to generate recovery codes: {str(e)}")

    def get_recovery_status(self, user: User) -> Dict[str, Any]:
        remaining = MFABackupCode.objects.filter(user=user, is_used=False, expires_at__gt=timezone.now()).count()
        total_used = MFABackupCode.objects.filter(user=user, is_used=True).count()
        return {
            'has_recovery_codes': remaining > 0,
            'remaining_codes': remaining,
            'used_codes': total_used,
            'warning': remaining <= 3,
            'message': f"You have {remaining} recovery code(s) remaining." if remaining <= 3 else None
        }

    def unlock_mfa_device(self, device_id: str, user: User = None, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str]:
        try:
            if user:
                device = user.auth_devices.filter(id=device_id).first()
            else:
                device = MFADevice.objects.filter(id=device_id).first()
            if not device:
                return False, "Device not found"
            if not device.is_locked():
                return False, "Device is not locked"
            device.reset_fail_count()
            device.locked_until = None
            device.save(update_fields=['fail_count', 'locked_until'])
            self._log_recovery_attempt(device.user, True, ip_address, user_agent, f'Device {device.name} unlocked')
            return True, f"Device '{device.name}' unlocked successfully"
        except Exception as e:
            logger.error(f"Failed to unlock device {device_id}: {e}", exc_info=True)
            return False, f"Failed to unlock device: {str(e)}"

    def _log_recovery_attempt(self, user: User, success: bool, ip_address: str, user_agent: str, message: str):
        try:
            MFAAuditLog.objects.create(
                user=user,
                device=None,
                event_type='recovery' if success else 'failed_recovery',
                ip_address=ip_address or '0.0.0.0',
                user_agent=user_agent or 'unknown',
                success=success,
                message=message,
                tenant_id=user.tenant_id
            )
        except Exception as e:
            logger.error(f"Failed to log recovery attempt: {e}")