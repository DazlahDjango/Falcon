"""
Audit model — Comprehensive audit logging for all user actions.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from .user import User


class AuditLog(BaseModel):
    # Actor
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name=_('user'), db_index=True)
    # Action details
    action = models.CharField(_('action'), max_length=100, db_index=True, help_text='e.g., user.login, kpi.create, review.approve')
    action_type = models.CharField(_('action type'), max_length=20, db_index=True, choices=[
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('export', 'Export'),
        ('view', 'View'),
    ])
    
    # Target (what was acted upon)
    content_type = models.CharField(_('content type'), max_length=100, blank=True, db_index=True, help_text='App.Model name')
    object_id = models.CharField(_('object ID'), max_length=100, blank=True, db_index=True)
    object_repr = models.CharField(_('object representation'), max_length=500, blank=True)
    
    # Changes
    old_value = models.JSONField(_('old value'), null=True, blank=True)
    new_value = models.JSONField(_('new value'), null=True, blank=True)
    changes = models.JSONField(_('changes'), default=dict, blank=True, help_text='Structured changes')
    
    # Request context
    ip_address = models.GenericIPAddressField(_('IP address'), db_index=True)
    user_agent = models.CharField(_('user agent'), max_length=500)
    referer = models.URLField(_('referer'), max_length=500, blank=True)
    request_method = models.CharField(_('request method'), max_length=10, blank=True)
    request_path = models.CharField(_('request path'), max_length=500, blank=True)
    
    # Location
    location_city = models.CharField(_('city'), max_length=100, blank=True)
    location_country = models.CharField(_('country'), max_length=100, blank=True)
    
    # Session
    session_key = models.CharField(_('session key'), max_length=40, blank=True, db_index=True)
    
    # Timing
    timestamp = models.DateTimeField(_('timestamp'), default=timezone.now, db_index=True)
    
    # Severity
    SEVERITY_INFO = 'info'
    SEVERITY_WARNING = 'warning'
    SEVERITY_ERROR = 'error'
    SEVERITY_CRITICAL = 'critical'
    
    SEVERITY_CHOICES = [
        (SEVERITY_INFO, 'Info'),
        (SEVERITY_WARNING, 'Warning'),
        (SEVERITY_ERROR, 'Error'),
        (SEVERITY_CRITICAL, 'Critical'),
    ]
    severity = models.CharField(_('severity'), max_length=20, choices=SEVERITY_CHOICES, default=SEVERITY_INFO, db_index=True)
    
    # Additional metadata
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    # Immutable flag (cannot be edited or deleted)
    is_immutable = models.BooleanField(_('immutable'), default=True, editable=False)
    
    class Meta:
        db_table = 'accounts_audit_log'
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['severity', 'timestamp']),
            models.Index(fields=['tenant_id', 'timestamp']),
        ]
    
    def __str__(self):
        actor = self.user.email if self.user else 'Anonymous'
        return f"{actor} - {self.action} at {self.timestamp}"
    
    def save(self, *args, **kwargs):
        """Prevent modification of immutable logs."""
        if self.pk and self.is_immutable:
            raise PermissionError("Cannot modify immutable audit log")
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of immutable logs."""
        if self.is_immutable:
            raise PermissionError("Cannot delete immutable audit log")
        super().delete(*args, **kwargs)
    
    @classmethod
    def log(cls, user, action, action_type, request=None, **kwargs):
        """Create an audit log entry."""
        data = {
            'user': user,
            'action': action,
            'action_type': action_type,
            'metadata': kwargs.get('metadata', {}),
            'old_value': kwargs.get('old_value'),
            'new_value': kwargs.get('new_value'),
            'changes': kwargs.get('changes', {}),
            'content_type': kwargs.get('content_type', ''),
            'object_id': str(kwargs.get('object_id', '')),
            'object_repr': kwargs.get('object_repr', ''),
            'severity': kwargs.get('severity', cls.SEVERITY_INFO),
        }
        
        if request:
            data['ip_address'] = cls.get_client_ip(request)
            data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]
            data['referer'] = request.META.get('HTTP_REFERER', '')[:500]
            data['request_method'] = request.method
            data['request_path'] = request.path
            data['session_key'] = request.session.session_key or ''
        
        return cls.objects.create(**data)
    
    @staticmethod
    def get_client_ip(request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')