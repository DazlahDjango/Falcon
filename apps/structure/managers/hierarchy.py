from django.db import models
from django.utils import timezone
from .base import BaseStructureManager

class HierarchyManager(BaseStructureManager):
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def current(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_current=True, is_deleted=False)
    def by_version_type(self, tenant_id, version_type):
        return self.filter(tenant_id=tenant_id, version_type=version_type, is_deleted=False)
    def get_version_on_date(self, tenant_id, date):
        return self.filter(tenant_id=tenant_id, effective_from__lte=date, is_deleted=False).filter(models.Q(effective_to__isnull=True) | models.Q(effective_to__gte=date)).order_by('-version_number').first()
    def get_version_by_hash(self, snapshot_hash):
        return self.filter(snapshot_hash=snapshot_hash, is_deleted=False).first()
    def get_previous_version(self, tenant_id, current_version_id):
        current = self.filter(id=current_version_id, tenant_id=tenant_id).first()
        if not current:
            return None
        return self.filter(tenant_id=tenant_id, version_number__lt=current.version_number, is_deleted=False).order_by('-version_number').first()
    def get_next_version(self, tenant_id, current_version_id):
        current = self.filter(id=current_version_id, tenant_id=tenant_id).first()
        if not current:
            return None
        return self.filter(tenant_id=tenant_id, version_number__gt=current.version_number, is_deleted=False).order_by('version_number').first()
    def archive_old_versions(self, tenant_id, keep_count=10):
        versions_to_archive = self.filter(tenant_id=tenant_id, is_current=False, is_deleted=False).order_by('-version_number')[keep_count:]
        return versions_to_archive.update(is_deleted=True, deleted_at=timezone.now())
    def get_version_range(self, tenant_id, from_version, to_version):
        return self.filter(tenant_id=tenant_id, version_number__gte=from_version, version_number__lte=to_version, is_deleted=False).order_by('version_number')
    def diff_versions(self, tenant_id, version_a_id, version_b_id):
        version_a = self.filter(id=version_a_id, tenant_id=tenant_id).first()
        version_b = self.filter(id=version_b_id, tenant_id=tenant_id).first()
        if not version_a or not version_b:
            return None
        import json
        from deepdiff import DeepDiff
        return DeepDiff(version_a.snapshot, version_b.snapshot, ignore_order=True)