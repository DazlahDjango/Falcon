import secrets
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel


class MFADevice(BaseModel):
    """
    MFA devices for user authentication.
    Supports TOTP, SMS, Email, and Hardware tokens.
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='auth_devices', verbose_name=_('user'))
    
    # Device type
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
    device_type = models.CharField(_('device type'), max_length=20, choices=DEVICE_CHOICES)
    
    # Device identifiers
    name = models.CharField(_('device name'), max_length=100, help_text='e.g., Google Authenticator, iPhone, etc.')
    secret = models.CharField(_('secret'), max_length=32, blank=True, help_text='TOTP secret key')
    phone = models.CharField(_('phone number'), max_length=20, blank=True, help_text='For SMS devices')
    email = models.EmailField(_('email address'), blank=True, help_text='For email devices')
    
    # Device status
    is_active = models.BooleanField(_('active'), default=True)
    is_primary = models.BooleanField(_('primary'), default=False, help_text='Primary device for MFA challenges')
    is_verified = models.BooleanField(_('verified'), default=False, help_text='Has been verified via OTP')
    verified_at = models.DateTimeField(_('verified at'), null=True, blank=True)
    
    # Usage tracking
    last_used_at = models.DateTimeField(_('last used at'), null=True, blank=True)
    fail_count = models.PositiveSmallIntegerField(_('fail count'), default=0)
    locked_until = models.DateTimeField(_('locked until'), null=True, blank=True)
    
    # Metadata
    device_info = models.JSONField(_('device info'), default=dict, blank=True, help_text='Browser/device information for hardware tokens')
    
    class Meta:
        db_table = 'accounts_mfa_device'
        verbose_name = _('MFA device')
        verbose_name_plural = _('MFA devices')
        unique_together = [['user', 'name']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['device_type', 'tenant_id']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_device_type_display()}) for {self.user.email}"
    
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

class MFABackupCode(BaseModel):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='backup_codes', verbose_name=_('user'))
    # Code fields
    code = models.CharField(_('backup code'), max_length=10, unique=True, db_index=True)
    code_hash = models.CharField(_('code hash'), max_length=128, help_text='Hashed code for security')
    # Status
    is_used = models.BooleanField(_('used'), default=False)
    used_at = models.DateTimeField(_('used at'), null=True, blank=True)
    # Expiry
    expires_at = models.DateTimeField(_('expires at'), db_index=True)
    class Meta:
        db_table = 'accounts_mfa_backup_code'
        verbose_name = _('MFA backup code')
        verbose_name_plural = _('MFA backup codes')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_used']),
            models.Index(fields=['code_hash']),
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
    def generate_codes(cls, user, count=10):
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            code_hash = secrets.token_hex(32)
            backup_code = cls.objects.create(
                user=user,
                code=code,
                code_hash=code_hash,
                expires_at=timezone.now() + timezone.timedelta(days=365)
            )
            codes.append(backup_code)
        return codes
    
class MFAAuditLog(BaseModel):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mfa_audit_logs', verbose_name=_('user'))
    device = models.ForeignKey(MFADevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    # Event type
    EVENT_ATTEMPT = 'attempt'
    EVENT_SUCCESS = 'success'
    EVENT_FAILURE = 'failure'
    EVENT_ENROLL = 'enroll'
    EVENT_DISABLE = 'disable'
    EVENT_BACKUP_USED = 'backup_used'
    
    EVENT_CHOICES = [
        (EVENT_ATTEMPT, 'Attempt'),
        (EVENT_SUCCESS, 'Success'),
        (EVENT_FAILURE, 'Failure'),
        (EVENT_ENROLL, 'Enroll'),
        (EVENT_DISABLE, 'Disable'),
        (EVENT_BACKUP_USED, 'Backup Code Used'),
    ]
    event_type = models.CharField(_('event type'), max_length=20, choices=EVENT_CHOICES, db_index=True)
    
    # Event details
    ip_address = models.GenericIPAddressField(_('IP address'), db_index=True)
    user_agent = models.CharField(_('user agent'), max_length=500)
    success = models.BooleanField(_('success'), default=False)
    message = models.TextField(_('message'), blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'accounts_mfa_audit_log'
        verbose_name = _('MFA audit log')
        verbose_name_plural = _('MFA audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['created_at', 'tenant_id']),
        ]
    
    def __str__(self):
        return f"{self.event_type} for {self.user.email} at {self.created_at}"