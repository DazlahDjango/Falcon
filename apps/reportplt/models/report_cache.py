# apps/reportplt/models/report_cache.py
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseModel
from ..managers import SoftDeleteManager

class ReportCache(BaseModel):
    report = models.ForeignKey('reportplt.Report', on_delete=models.CASCADE, related_name='cache_entries')
    execution = models.ForeignKey('reportplt.ReportExecution', on_delete=models.SET_NULL, null=True, blank=True, related_name='cache_entries')
    cache_key = models.CharField(_('cache key'), max_length=255, db_index=True, unique=True)
    data = models.JSONField(_('cached data'), default=dict)
    raw_data = models.BinaryField(_('raw cached data'), null=True, blank=True)
    format = models.CharField(_('format'), max_length=20, default='json')
    size = models.BigIntegerField(_('cache size (bytes)'), default=0)
    compressed = models.BooleanField(_('compressed'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    expires_at = models.DateTimeField(_('expires at'), db_index=True)
    last_accessed_at = models.DateTimeField(_('last accessed at'), null=True, blank=True)
    access_count = models.PositiveIntegerField(_('access count'), default=0)
    version = models.PositiveIntegerField(_('version'), default=1)
    is_stale = models.BooleanField(_('is stale'), default=False)
    parameters_hash = models.CharField(_('parameters hash'), max_length=64, blank=True, db_index=True)
    
    objects = SoftDeleteManager()
    
    class Meta:
        db_table = 'reportplt_cache'
        verbose_name = _('report cache')
        verbose_name_plural = _('report cache entries')
        indexes = [
            models.Index(fields=['tenant_id', 'report_id', 'cache_key']),
            models.Index(fields=['tenant_id', 'expires_at']),
            models.Index(fields=['tenant_id', 'is_stale']),
            models.Index(fields=['tenant_id', 'parameters_hash']),
        ]
    
    def __str__(self):
        return f"{self.report.name} - {self.cache_key}"
    
    def is_expired(self):
        return timezone.now() >= self.expires_at
    
    def is_valid(self):
        return not self.is_expired() and not self.is_stale
    
    def record_access(self):
        self.access_count += 1
        self.last_accessed_at = timezone.now()
        self.save(update_fields=['access_count', 'last_accessed_at'])
    
    def mark_stale(self):
        self.is_stale = True
        self.save(update_fields=['is_stale'])
    
    def refresh(self, new_data):
        from copy import deepcopy
        self.data = deepcopy(new_data)
        self.is_stale = False
        self.created_at = timezone.now()
        self.version += 1
        self.save(update_fields=['data', 'is_stale', 'created_at', 'version'])
    
    @classmethod
    def get_or_create(cls, report, parameters, expires_in=3600):
        import hashlib
        param_str = str(sorted(parameters.items())) if parameters else ''
        param_hash = hashlib.sha256(param_str.encode()).hexdigest()
        cache_key = f"{report.id}_{param_hash}"
        cache, created = cls.objects.get_or_create(
            report=report,
            cache_key=cache_key,
            defaults={
                'parameters_hash': param_hash,
                'expires_at': timezone.now() + timezone.timedelta(seconds=expires_in),
                'tenant_id': report.tenant_id,
            }
        )
        if not created and cache.is_expired():
            cache.is_stale = True
            cache.save(update_fields=['is_stale'])
        return cache, created