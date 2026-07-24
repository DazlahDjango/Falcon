# apps/reportplt/models/report_share.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportShare(BaseModel):
    SHARE_TYPES = [
        ('internal', 'Internal Share'),
        ('external', 'External Share'),
        ('public', 'Public Link'),
    ]
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('comment', 'View & Comment'),
        ('edit', 'View, Comment & Edit'),
        ('export', 'View, Comment, Edit & Export'),
    ]
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='shared_reports')
    shared_with = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='shared_with_me')
    share_type = models.CharField(_('share type'), max_length=50, choices=SHARE_TYPES, default='internal')
    permission = models.CharField(_('permission'), max_length=50, choices=PERMISSION_CHOICES, default='view')
    share_link = models.CharField(_('share link'), max_length=255, blank=True, db_index=True)
    share_token = models.CharField(_('share token'), max_length=255, blank=True, db_index=True)
    is_active = models.BooleanField(_('is active'), default=True)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)
    last_accessed_at = models.DateTimeField(_('last accessed at'), null=True, blank=True)
    access_count = models.PositiveIntegerField(_('access count'), default=0)
    password = models.CharField(_('password'), max_length=128, blank=True)
    password_protected = models.BooleanField(_('password protected'), default=False)
    message = models.TextField(_('message'), blank=True)
    include_attachments = models.BooleanField(_('include attachments'), default=True)
    notify_recipient = models.BooleanField(_('notify recipient'), default=True)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_share'
        verbose_name = _('report share')
        verbose_name_plural = _('report shares')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'shared_with_id']),
            models.Index(fields=['tenant_id', 'share_link', 'is_active']),
            models.Index(fields=['tenant_id', 'share_token']),
            models.Index(fields=['tenant_id', 'expires_at']),
            models.Index(fields=['tenant_id', 'shared_by_id']),
        ]
        unique_together = [['report_id', 'shared_with_id', 'share_type']]
    
    def __str__(self):
        return f"{self.report.name} -> {self.shared_with} ({self.permission})"
    
    def is_expired(self):
        return self.expires_at and timezone.now() >= self.expires_at
    
    def is_valid(self):
        return self.is_active and not self.is_expired()
    
    def record_access(self):
        self.access_count += 1
        self.last_accessed_at = timezone.now()
        self.save(update_fields=['access_count', 'last_accessed_at'])
    
    def generate_share_link(self):
        import uuid
        self.share_token = uuid.uuid4().hex
        self.share_link = f"/share/{self.share_token}"
        self.save(update_fields=['share_token', 'share_link'])
        return self.share_link
    
    def deactivate(self):
        self.is_active = False
        self.save(update_fields=['is_active'])
    
    def activate(self):
        self.is_active = True
        self.save(update_fields=['is_active'])