# apps/accounts/models/mfa.py
"""
MFA Models - Production Ready
Supports TOTP, backup codes, and audit logging
"""

import secrets
import hashlib
import logging
from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers.mfa import (
    MFADeviceManager,
    MFABackupCodeManager,
    MFAAuditLogManager
)
logger = logging.getLogger(__name__)

class MFADevice(BaseModel):
    DEVICE_TOTP = 'totp'
    DEVICE_SMS = 'sms'
    DEVICE_EMAIL = 'email'
    DEVICE_HARDWARE = 'hardware'
    DEVICE_BACKUP = 'backup'
    DEVICE_CHOICES = [
        (DEVICE_TOTP, 'TOTP Authenticator'),
        (DEVICE_SMS, 'SMS'),
        (DEVICE_EMAIL, 'Email'),
        (DEVICE_HARDWARE, 'Hardware Token'),
        (DEVICE_BACKUP, 'Backup Code'),
    ]
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='auth_devices', verbose_name=_('user'))
    device_type = models.CharField(_('device type'), max_length=20, choices=DEVICE_CHOICES)
    name = models.CharField(_('device name'), max_length=100, help_text='e.g., Google Authenticator, iPhone')
    _secret = models.BinaryField(_('encrypted secret'), blank=True, null=True, db_column='secret')
    phone = models.CharField(_('phone number'), max_length=20, blank=True, help_text='For SMS devices')
    email = models.EmailField(_('email address'), blank=True, help_text='For email devices')
    is_active = models.BooleanField(_('active'), default=True)
    is_primary = models.BooleanField(_('primary'), default=False, help_text='Primary device for MFA challenges')
    is_verified = models.BooleanField(_('verified'), default=False, help_text='Has been verified via OTP')
    verified_at = models.DateTimeField(_('verified at'), null=True, blank=True)
    last_used_at = models.DateTimeField(_('last used at'), null=True, blank=True)
    fail_count = models.PositiveSmallIntegerField(_('fail count'), default=0)
    locked_until = models.DateTimeField(_('locked until'), null=True, blank=True)
    device_info = models.JSONField(_('device info'), default=dict, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = MFADeviceManager()
    class Meta:
        db_table = 'accounts_mfa_device'
        verbose_name = _('MFA device')
        verbose_name_plural = _('MFA devices')
        unique_together = [['user', 'name']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['device_type', 'tenant_id']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_device_type_display()}) for {self.user.email}"
    
    @property
    def secret(self):
        if not self._secret:
            return None
        try:
            encrypted_data = self._secret
            if isinstance(encrypted_data, memoryview):
                encrypted_data = bytes(encrypted_data)
            elif isinstance(encrypted_data, str):
                encrypted_data = encrypted_data.encode()
            
            fernet = Fernet(settings.MFA_ENCRYPTION_KEY.encode())
            decrypted = fernet.decrypt(encrypted_data)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Secret decryption failed for device {self.id}: {e}")
            return None
    
    @secret.setter
    def secret(self, value):
        if value:
            if isinstance(value, bytes):
                value = value.decode()
            fernet = Fernet(settings.MFA_ENCRYPTION_KEY.encode())
            encrypted = fernet.encrypt(value.encode())
            self._secret = encrypted
        else:
            self._secret = None
    
    def increment_fail_count(self):
        self.fail_count += 1
        if self.fail_count >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=15)
        self.save(update_fields=['fail_count', 'locked_until'])
    
    def reset_fail_count(self):
        self.fail_count = 0
        self.locked_until = None
        self.save(update_fields=['fail_count', 'locked_until'])
    
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        return False
    
    def mark_used(self):
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def verify(self):
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save(update_fields=['is_verified', 'verified_at'])
        logger.info(f"MFA device {self.id} verified for user {self.user.email}")

class MFABackupCode(BaseModel):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='backup_codes', verbose_name=_('user'))
    code_hash = models.CharField(_('code hash'), max_length=128, unique=True, db_index=True)
    is_used = models.BooleanField(_('used'), default=False)
    used_at = models.DateTimeField(_('used at'), null=True, blank=True)
    expires_at = models.DateTimeField(_('expires at'), db_index=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = MFABackupCodeManager()
    class Meta:
        db_table = 'accounts_mfa_backup_code'
        verbose_name = _('MFA backup code')
        verbose_name_plural = _('MFA backup codes')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_used']),
            models.Index(fields=['code_hash']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return f"Backup code for {self.user.email} ({'used' if self.is_used else 'unused'})"
    
    def use(self):
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])
    
    def is_valid(self):
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True
    
    @classmethod
    def hash_code(cls, raw_code, user_email):
        salt = user_email.encode()
        return hashlib.pbkdf2_hmac('sha256', raw_code.encode(), salt, 100000).hex()
    
    @classmethod
    def generate_codes(cls, user, count=10):
        raw_codes = []
        backup_codes = []
        for _ in range(count):
            raw_code = secrets.token_urlsafe(9)[:12]
            code_hash = cls.hash_code(raw_code, user.email)
            backup_code = cls.objects.create(
                user=user,
                code_hash=code_hash,
                expires_at=timezone.now() + timezone.timedelta(days=90)
            )
            raw_codes.append(raw_code)
            backup_codes.append(backup_code)
        logger.info(f"Generated {count} backup codes for user {user.email}")
        return raw_codes, backup_codes
    
    @classmethod
    def verify_code(cls, user, raw_code):
        code_hash = cls.hash_code(raw_code, user.email)
        try:
            backup_code = cls.objects.get(
                user=user,
                code_hash=code_hash,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            backup_code.use()
            logger.info(f"Backup code used for user {user.email}")
            return True, backup_code
        except cls.DoesNotExist:
            return False, None

class MFAAuditLog(BaseModel):
    EVENT_ATTEMPT = 'attempt'
    EVENT_SUCCESS = 'success'
    EVENT_FAILURE = 'failure'
    EVENT_ENROLL = 'enroll'
    EVENT_DISABLE = 'disable'
    EVENT_BACKUP_USED = 'backup_used'
    EVENT_LOCKOUT = 'lockout'
    EVENT_CHOICES = [
        (EVENT_ATTEMPT, 'Attempt'),
        (EVENT_SUCCESS, 'Success'),
        (EVENT_FAILURE, 'Failure'),
        (EVENT_ENROLL, 'Enroll'),
        (EVENT_DISABLE, 'Disable'),
        (EVENT_BACKUP_USED, 'Backup Code Used'),
        (EVENT_LOCKOUT, 'Account Lockout'),
    ]
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mfa_audit_logs', verbose_name=_('user'))
    device = models.ForeignKey(MFADevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    event_type = models.CharField(_('event type'), max_length=20, choices=EVENT_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(_('IP address'), db_index=True, null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=2000, blank=True, default='')
    success = models.BooleanField(_('success'), default=False)
    message = models.TextField(_('message'), blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    request_id = models.CharField(_('request ID'), max_length=100, blank=True, db_index=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    objects = MFAAuditLogManager()
    class Meta:
        db_table = 'accounts_mfa_audit_log'
        verbose_name = _('MFA audit log')
        verbose_name_plural = _('MFA audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['created_at', 'tenant_id']),
            models.Index(fields=['request_id']),
            models.Index(fields=['is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.event_type} for {self.user.email} at {self.created_at}"