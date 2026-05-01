from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .base import BaseStructureModel


class HierarchyVersion(BaseStructureModel):
    VERSION_TYPE_CHOICES = [
        ('auto', 'Auto-saved'),
        ('manual', 'Manual Snapshot'),
        ('restructure', 'Reorganization'),
        ('yearly', 'Yearly Archive'),
        ('acquisition', 'Merger/Acquisition'),
    ]
    version_number = models.PositiveIntegerField(_('version number'), db_index=True)
    name = models.CharField(_('version name'), max_length=255, blank=True)
    description = models.TextField(_('description'), blank=True)
    version_type = models.CharField(_('version type'), max_length=20, choices=VERSION_TYPE_CHOICES, default='auto')
    snapshot = models.JSONField(_('snapshot data'), help_text=_("Full org structure snapshot at this point in time"))
    snapshot_hash = models.CharField(_('snapshot hash'), max_length=64, unique=True, db_index=True)
    effective_from = models.DateTimeField(_('effective from'), db_index=True)
    effective_to = models.DateTimeField(_('effective to'), null=True, blank=True)
    is_current = models.BooleanField(_('is current'), default=False, db_index=True)
    changes_summary = models.JSONField(_('changes summary'), default=dict, blank=True, help_text=_("Summary of changes from previous version"))
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)
    approved_at = models.DateTimeField(_('approved at'), null=True, blank=True)
    approved_notes = models.TextField(_('approved notes'), blank=True)
    
    class Meta:
        db_table = 'structure_hierarchy_version'
        verbose_name = _('hierarchy version')
        verbose_name_plural = _('hierarchy versions')
        unique_together = [['tenant_id', 'version_number']]
        indexes = [
            models.Index(fields=['tenant_id', 'is_current']),
            models.Index(fields=['tenant_id', 'effective_from', 'effective_to']),
            models.Index(fields=['snapshot_hash']),
            models.Index(fields=['version_type']),
        ]
    def __str__(self):
        return f"v{self.version_number} - {self.get_version_type_display()} ({self.effective_from.date()})"
    @classmethod
    def capture_current(cls, tenant_id, version_type='auto', description='', created_by=None):
        from ..services import TreeBuilder
        snapshot = TreeBuilder().build_full_tree(tenant_id)
        import hashlib
        import json
        snapshot_hash = hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest()
        latest_version = cls.objects.filter(tenant_id=tenant_id).order_by('-version_number').first()
        version_number = (latest_version.version_number + 1) if latest_version else 1
        if latest_version:
            latest_version.is_current = False
            latest_version.save(update_fields=['is_current'])
        return cls.objects.create(
            tenant_id=tenant_id,
            version_number=version_number,
            version_type=version_type,
            description=description,
            snapshot=snapshot,
            snapshot_hash=snapshot_hash,
            effective_from=timezone.now(),
            is_current=True,
            created_by=created_by,
        )