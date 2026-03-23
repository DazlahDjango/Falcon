"""
Login Attempt model — Tracks all login attempts for security monitoring.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .user import User


class LoginAttempt(BaseModel):
    # User (if known)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='attempts', verbose_name=_('user'))
    # Identifier (email or username used)
    identifier = models.CharField(_('identifier'), max_length=255, db_index=True, help_text='Email or username attempted')
    
    # Result
    SUCCESS = 'success'
    FAILURE = 'failure'
    LOCKED = 'locked'
    
    RESULT_CHOICES = [
        (SUCCESS, 'Success'),
        (FAILURE, 'Failure'),
        (LOCKED, 'Locked'),
    ]
    result = models.CharField(_('result'), max_length=20, choices=RESULT_CHOICES, db_index=True)
    
    # Failure reason
    REASON_WRONG_PASSWORD = 'wrong_password'
    REASON_USER_NOT_FOUND = 'user_not_found'
    REASON_ACCOUNT_LOCKED = 'account_locked'
    REASON_MFA_FAILED = 'mfa_failed'
    REASON_MFA_REQUIRED = 'mfa_required'
    REASON_INACTIVE = 'inactive'
    REASON_RATE_LIMIT = 'rate_limit'
    
    REASON_CHOICES = [
        (REASON_WRONG_PASSWORD, 'Wrong Password'),
        (REASON_USER_NOT_FOUND, 'User Not Found'),
        (REASON_ACCOUNT_LOCKED, 'Account Locked'),
        (REASON_MFA_FAILED, 'MFA Failed'),
        (REASON_MFA_REQUIRED, 'MFA Required'),
        (REASON_INACTIVE, 'Inactive Account'),
        (REASON_RATE_LIMIT, 'Rate Limit Exceeded'),
    ]
    failure_reason = models.CharField(_('failure reason'), max_length=30, blank=True, choices=REASON_CHOICES)
    # Request information
    ip_address = models.GenericIPAddressField(_('IP address'), db_index=True)
    user_agent = models.CharField(_('user agent'), max_length=500)
    referer = models.URLField(_('referer'), max_length=500, blank=True)
    # Location information
    location_city = models.CharField(_('city'), max_length=100, blank=True)
    location_country = models.CharField(_('country'), max_length=100, blank=True)
    # Timing
    attempted_at = models.DateTimeField(_('attempted at'), default=timezone.now, db_index=True)
    # Session tracking
    session_key = models.CharField(_('session key'), max_length=40, blank=True)
    
    # Additional context
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'accounts_login_attempt'
        verbose_name = _('login attempt')
        verbose_name_plural = _('login attempts')
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['identifier', 'attempted_at']),
            models.Index(fields=['ip_address', 'attempted_at']),
            models.Index(fields=['result', 'attempted_at']),
            models.Index(fields=['user', 'attempted_at']),
            models.Index(fields=['created_at', 'tenant_id']),
        ]
    
    def __str__(self):
        return f"Login attempt for {self.identifier} - {self.result} at {self.attempted_at}"
    
    @classmethod
    def get_recent_attempts(cls, identifier, minutes=15):
        """Get recent login attempts for an identifier."""
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return cls.objects.filter(identifier=identifier, attempted_at__gte=cutoff)
    
    @classmethod
    def get_failure_count(cls, identifier, minutes=15):
        """Get failure count for an identifier in last X minutes."""
        return cls.get_recent_attempts(identifier, minutes).filter(result=cls.FAILURE).count()
    
    @classmethod
    def record_attempt(cls, identifier, result, user=None, failure_reason='', request=None, **kwargs):
        """Record a login attempt."""
        data = {
            'identifier': identifier,
            'result': result,
            'user': user,
            'failure_reason': failure_reason,
            'metadata': kwargs,
        }
        
        if request:
            data['ip_address'] = cls.get_client_ip(request)
            data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]
            data['referer'] = request.META.get('HTTP_REFERER', '')[:500]
            data['session_key'] = request.session.session_key or ''
        
        return cls.objects.create(**data)
    
    @staticmethod
    def get_client_ip(request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')