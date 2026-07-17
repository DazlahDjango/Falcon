# managers/base.py - FIXED

from django.db import models
import threading
import logging

logger = logging.getLogger(__name__)


class BaseManager(models.Manager):
    def active(self):
        # Only call is_active if the model has this field
        if hasattr(self.model, 'is_active'):
            return self.filter(is_active=True)
        return self.all()

    def by_tenant(self, tenant_id):
        if hasattr(self.model, 'tenant_id'):
            return self.filter(tenant_id=tenant_id)
        return self.all()

    def created_between(self, start_date, end_date):
        if hasattr(self.model, 'created_at'):
            return self.filter(created_at__range=[start_date, end_date])
        return self.all()

    def latest_first(self):
        if hasattr(self.model, 'created_at'):
            return self.order_by('-created_at')
        return self.all()

    def oldest_first(self):
        if hasattr(self.model, 'created_at'):
            return self.order_by('created_at')
        return self.all()


class TenantAwareManager(BaseManager):
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = self._get_current_tenant_id()
        if tenant_id and hasattr(self.model, 'tenant_id'):
            return queryset.filter(tenant_id=tenant_id)
        return queryset

    def _get_current_tenant_id(self):
        # 1. Try apps.tenant.context
        try:
            from apps.tenant.context import get_current_tenant_id
            tid = get_current_tenant_id()
            if tid:
                return tid
        except ImportError:
            pass

        # 2. Try KPIContextMiddleware
        try:
            from apps.kpi.middleware.kpi import KPIContextMiddleware
            tid = KPIContextMiddleware.get_current_tenant_id()
            if tid:
                return tid
        except ImportError:
            pass

        # 3. Try thread properties (backward compatibility)
        try:
            curr_thread = threading.current_thread()
            tid = getattr(curr_thread, 'current_tenant_id', None) or getattr(curr_thread, 'tenant_id', None)
            if tid:
                return tid
        except:
            pass

        return None

    def accessible_by_user(self, user):
        return self.get_queryset()


class SoftDeleteManager(TenantAwareManager):
    def get_queryset(self):
        queryset = super().get_queryset()
        # Only filter by is_deleted if the model has this field
        if hasattr(self.model, 'is_deleted'):
            return queryset.filter(is_deleted=False)
        return queryset

    def all_with_deleted(self):
        return super().get_queryset()

    def deleted_only(self):
        queryset = super().get_queryset()
        if hasattr(self.model, 'is_deleted'):
            return queryset.filter(is_deleted=True)
        return queryset.none()


class BulkOperationManager(BaseManager):
    def bulk_create_safe(self, objs, batch_size=1000, ignore_conflicts=False):
        if not objs:
            return []
        results = []
        for i in range(0, len(objs), batch_size):
            batch = objs[i:i + batch_size]
            try:
                results.extend(self.bulk_create(batch, ignore_conflicts=ignore_conflicts))
            except Exception as e:
                logger.exception(f"Bulk create failed for batch: {e}")
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
                logger.exception(f"Bulk update failed for batch: {e}")
                continue
        return updated


class QueryCountDebugManager(BaseManager):
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self, '_debug_query_count'):
            from django.db import connection
            import time
            start = time.time()
            result = list(queryset)
            elapsed = time.time() - start
            print(f'Query count: {len(connection.queries)}, Time: {elapsed:.3f}s')
            return result
        return queryset