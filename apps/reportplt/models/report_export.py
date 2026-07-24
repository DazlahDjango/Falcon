# apps/reportplt/models/report_export.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import ExportManager

class ReportExport(BaseModel):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('pptx', 'PowerPoint'),
        ('html', 'HTML'),
        ('xml', 'XML'),
    ]
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    DELIVERY_CHOICES = [
        ('download', 'Download'),
        ('email', 'Email'),
        ('s3', 'S3 Storage'),
        ('webhook', 'Webhook'),
    ]
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, related_name='exports')
    execution = models.ForeignKey('reportplt.ReportExecution', on_delete=models.SET_NULL, null=True, blank=True, related_name='exports')
    format = models.CharField(_('format'), max_length=20, choices=FORMAT_CHOICES, db_index=True)
    status = models.CharField(_('status'), max_length=50, choices=STATUS_CHOICES, default='queued', db_index=True)
    exported_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='exports')
    file_path = models.CharField(_('file path'), max_length=500, blank=True)
    file_name = models.CharField(_('file name'), max_length=255, blank=True)
    file_size = models.BigIntegerField(_('file size (bytes)'), default=0)
    file_hash = models.CharField(_('file hash'), max_length=64, blank=True)
    mime_type = models.CharField(_('mime type'), max_length=100, blank=True)
    page_count = models.PositiveIntegerField(_('page count'), default=0)
    is_compressed = models.BooleanField(_('is compressed'), default=False)
    is_encrypted = models.BooleanField(_('is encrypted'), default=False)
    password_protected = models.BooleanField(_('password protected'), default=False)
    password = models.CharField(_('password'), max_length=128, blank=True)
    has_watermark = models.BooleanField(_('has watermark'), default=False)
    watermark_text = models.CharField(_('watermark text'), max_length=255, blank=True)
    delivered_via = models.CharField(_('delivered via'), max_length=50, choices=DELIVERY_CHOICES, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    download_count = models.PositiveIntegerField(_('download count'), default=0)
    last_downloaded_at = models.DateTimeField(_('last downloaded at'), null=True, blank=True)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)
    export_config = models.JSONField(_('export configuration'), default=dict)
    department = models.CharField(_('department'), max_length=100, blank=True)
    team = models.CharField(_('team'), max_length=100, blank=True)
    
    objects = ExportManager()
    
    class Meta:
        db_table = 'reportplt_export'
        verbose_name = _('report export')
        verbose_name_plural = _('report exports')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'status']),
            models.Index(fields=['tenant_id', 'format', 'status']),
            models.Index(fields=['tenant_id', 'exported_by_id', 'created_at']),
            models.Index(fields=['tenant_id', 'expires_at']),
            models.Index(fields=['tenant_id', 'file_hash']),
        ]
    
    def __str__(self):
        return f"{self.report.name} - {self.format} ({self.status})"
    
    def is_ready(self):
        return self.status == 'completed' and self.file_path
    
    def is_expired(self):
        return self.expires_at and timezone.now() >= self.expires_at
    
    def is_downloadable(self):
        return self.is_ready() and not self.is_expired()
    
    def mark_processing(self):
        self.status = 'processing'
        self.save(update_fields=['status'])
    
    def mark_completed(self, file_path, file_name, file_size, mime_type, page_count=0):
        self.status = 'completed'
        self.file_path = file_path
        self.file_name = file_name
        self.file_size = file_size
        self.mime_type = mime_type
        self.page_count = page_count
        self.save(update_fields=['status', 'file_path', 'file_name', 'file_size', 'mime_type', 'page_count'])
    
    def mark_failed(self):
        self.status = 'failed'
        self.save(update_fields=['status'])
    
    def mark_cancelled(self):
        self.status = 'cancelled'
        self.save(update_fields=['status'])
    
    def mark_delivered(self, delivery_method):
        self.delivered_via = delivery_method
        self.delivered_at = timezone.now()
        self.save(update_fields=['delivered_via', 'delivered_at'])
    
    def record_download(self):
        self.download_count += 1
        self.last_downloaded_at = timezone.now()
        self.save(update_fields=['download_count', 'last_downloaded_at'])