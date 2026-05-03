from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _ 
from .base import BaseModel
from .user import User
from ..managers.session import SessionBlacklistManager

class UserSession(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', verbose_name=_('user'))
    # Session identifiers
    session_key = models.CharField(_('session key'), max_length=40, unique=True, db_index=True)
    jwt_token_id = models.CharField(_('JWT token ID'), max_length=50, blank=True, db_index=True, help_text='JTI claim for token revocation')
    # Device information
    ip_address = models.GenericIPAddressField(_('IP address'), db_index=True)
    user_agent = models.CharField(_('user agent'), max_length=500)
    device_type = models.CharField(_('device type'), max_length=50, blank=True, help_text='Desktop, Mobile, Tablet')
    browser = models.CharField(_('browser'), max_length=50, blank=True)
    os = models.CharField(_('operating system'), max_length=50, blank=True)
    # Location information (optional)
    location_city = models.CharField(_('city'), max_length=100, blank=True)
    location_country = models.CharField(_('country'), max_length=100, blank=True)
    location_lat = models.DecimalField(_('latitude'), max_digits=10, decimal_places=7, null=True, blank=True)
    location_lng = models.DecimalField(_('longitude'), max_digits=10, decimal_places=7, null=True, blank=True)
    # Session timing
    login_time = models.DateTimeField(_('login time'), default=timezone.now, db_index=True)
    last_activity = models.DateTimeField(_('last activity'), auto_now=True, db_index=True)
    expires_at = models.DateTimeField(_('expires at'), db_index=True, null=True, blank=True)
    logout_time = models.DateTimeField(_('logout time'), null=True, blank=True)
    # Session status
    SESSION_ACTIVE = 'active'
    SESSION_EXPIRED = 'expired'
    SESSION_LOGGED_OUT = 'logged_out'
    SESSION_REVOKED = 'revoked'
    STATUS_CHOICES = [
        (SESSION_ACTIVE, 'Active'),
        (SESSION_EXPIRED, 'Expired'),
        (SESSION_LOGGED_OUT, 'Logged Out'),
        (SESSION_REVOKED, 'Revoked'),
    ]
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=SESSION_ACTIVE, db_index=True)
    # MFA verification
    mfa_verified = models.BooleanField(_('MFA verified'), default=False)
    mfa_verified_at = models.DateTimeField(_('MFA verified at'), null=True, blank=True)
    # Security flags
    is_trusted_device = models.BooleanField(_('trusted device'), default=False)
    security_alerts = models.JSONField(_('security alerts'), default=list, blank=True, help_text='List of security alerts for this session')
    class Meta:
        db_table = 'accounts_user_session'
        verbose_name = _('user session')
        verbose_name_plural = _('user sessions')
        ordering = ['-login_time']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['session_key']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['ip_address', 'user', 'tenant_id']),
        ]

    def __str__(self):
        return f"Session for {self.user.email} {self.login_time}"
    
    @property
    def is_active(self):
        if self.status != self.SESSION_ACTIVE:
            return False
        if timezone.now() > self.expires_at:
            self.expire()
            return False
        return True
    
    def expire(self):
        self.status = self.SESSION_EXPIRED
        self.save(update_fields=['status'])
    
    def revoke(self):
        self.status = self.SESSION_REVOKED
        self.logout_time = timezone.now()
        self.save(update_fields=['status', 'logout_time'])
    
    def logout(self):
        self.status = self.SESSION_LOGGED_OUT
        self.logout_time = timezone.now()
        self.save(update_fields=['status', 'logout_time'])
    
    def refresh_expiry(self, duration_hours=24):
        self.expires_at = timezone.now() + timezone.timedelta(hours=duration_hours)
        self.save(update_fields=['expires_at'])

    def add_security_alert(self, alert_type, details=None):
        alert = {
            'type': alert_type,
            'timestamp': timezone.now(),
            'details': details or {}
        }
        self.security_alerts.append(alert)
        self.save(update_fields=['security_alerts'])

class SessionBlacklist(BaseModel):
    """
    Blacklisted JWT tokens and session keys for immediate revocation.
    """
    objects = SessionBlacklistManager()

    token_id = models.CharField(_('token ID'), max_length=50, unique=True, db_index=True, help_text='JTI claim')
    token_type = models.CharField(_('token type'), max_length=20, choices=[('access', 'Access'), ('refresh', 'Refresh')])
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='blacklisted_tokens')
    blacklisted_at = models.DateTimeField(_('blacklisted at'), default=timezone.now)
    expires_at = models.DateTimeField(_('expires at'), db_index=True, null=True, blank=True, help_text='When this blacklist entry expires')
    reason = models.CharField(_('reason'), max_length=200, blank=True)
    
    class Meta:
        db_table = 'accounts_session_blacklist'
        verbose_name = _('session blacklist')
        verbose_name_plural = _('session blacklists')
        indexes = [
            models.Index(fields=['token_id']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Blacklisted {self.token_type} token: {self.token_id}"
    
    def is_valid(self):
        """Check if blacklist entry is still valid (not expired)."""
        return timezone.now() < self.expires_at