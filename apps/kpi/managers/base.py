from django.db import models
from django.utils import timezone
from django.core.exceptions import PermissionDenied

class BaseManager(models.Manager):
    def active(self):
        return self.filter(is_active=True)
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)
    def created_between(self, start_date, end_date):
        return self.filter(created_at__range=[start_date, end_date])
    def latest_first(self):
        return self.order_by('-created_at')
    def oldest_first(self):
        return self.order_by('created_at')
    
class TenantAwareManager(BaseManager):
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = self._get_current_tenant_id()
        if tenant_id:
            return queryset.filter(tenant_id=tenant_id)
        return queryset
    
    def _get_current_tenant_id(self):
        try:
            from django.core import signals
            import threading
            return getattr(threading.current_thread(), 'current_tenant_id', None)
        except:
            return None
    
    def accessible_by_user(self, user):
        return self.get_queryset()

class SoftDeleteManager(TenantAwareManager):
    def get_queryset(self):
        return super().get_queryset()
    def all_with_deleted(self):
        return super().get_queryset()
    def deleted_only(self):
        return super().get_queryset().filter(is_deleted=True)
    
class BulkOperationManager(BaseManager):
    def bulk_create_safe(self, objs, batch_size=1000, ignore_conflicts=False):
        if not objs:
            return []
        results = []
        for i in range(0, len(objs), batch_size):
            batch = objs[i:i + batch_size]
            try:
                result = self.bulk_create(batch, ignore_conflicts=ignore_conflicts)
                results.extend(result)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Bulk create failed for batch {e}: {e}")
                continue
        return results
    
    def bulk_update_safe(self, objs, fields, batch_size=1000):
        if not objs:
            return 0
        updated = 0
        for i in range(0, len(objs), batch_size):
            batch = objs[i:i + batch_size]
            try:
                updated += self.bulk_update(batch, fields)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Bulk update failed for batch {i}: {e}")
                continue
        return updated
    
class QueryCountDebugManager(BaseManager):
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self, '_debug_query_count'):
            import time
            start = time.time()
            result = list(queryset)
            elapsed = time.time() - start
            from django.db import connection
            print(f'Query count: {len(connection.queries)}, Time: {elapsed:.3f}s')
            return result
        return queryset
    