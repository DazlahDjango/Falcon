from django.db import models, connection
from django.utils import timezone

# --- Base Classes ---

class BaseQuerySet(models.QuerySet):
    def active(self):
        if hasattr(self.model, 'is_active'):
            return self.filter(is_active=True)
        return self
    
    def deleted(self):
        if hasattr(self.model, 'is_deleted'):
            return self.filter(is_deleted=True)
        return self.none()
    
    def not_deleted(self):
        if hasattr(self.model, 'is_deleted'):
            return self.filter(is_deleted=False)
        return self
    
    def recent(self, days=30):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(created_at__gte=cutoff)
    
    def get_or_none(self, **kwargs):
        try:
            return self.get(**kwargs)
        except self.model.DoesNotExist:
            return None

class BaseManager(models.Manager):
    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()
    
    def deleted(self):
        return self.get_queryset().deleted()
    
    def not_deleted(self):
        return self.get_queryset().not_deleted()
    
    def recent(self, days=30):
        return self.get_queryset().recent(days)
    
    def get_or_none(self, **kwargs):
        return self.get_queryset().get_or_none(**kwargs)

class TenantAwareQuerySet(BaseQuerySet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._current_tenant_id = None

    def tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)
    
    def for_current_tenant(self):
        if self._current_tenant_id:
            return self.filter(tenant_id=self._current_tenant_id)
        return self
    
    def set_current_tenant(self, tenant_id):
        self._current_tenant_id = tenant_id
        return self
    
    def bulk_create_tenant_aware(self, objs, tenant_id=None, **kwargs):
        if tenant_id:
            for obj in objs:
                if hasattr(obj, 'tenant_id'):
                    obj.tenant_id = tenant_id
        return super().bulk_create(objs, **kwargs)

class TenantAwareManager(BaseManager):
    def get_queryset(self):
        qs = TenantAwareQuerySet(self.model, using=self._db)
        if hasattr(self.model, 'tenant_id'):
            from django.core.cache import cache
            current_tenant = cache.get('current_tenant_id')
            if current_tenant:
                qs = qs.filter(tenant_id=current_tenant)
        return qs
    
    def for_tenant(self, tenant_id):
        return self.get_queryset().tenant(tenant_id)

class SoftDeleteManager(TenantAwareManager):
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.model, 'is_deleted'):
            return qs.filter(is_deleted=False)
        return qs
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def deleted_only(self):
        if hasattr(self.model, 'is_deleted'):
            return super().get_queryset().filter(is_deleted=True)
        return self.none()

# --- Specialised Managers ---

class OrganisationQuerySet(TenantAwareQuerySet):
    def commercial(self): return self.filter(sector='COMMERCIAL')
    def ngo(self): return self.filter(sector='NGO')
    def public_sector(self): return self.filter(sector='PUBLIC')
    def verified(self): return self.filter(is_verified=True)
    def active(self): return self.filter(is_active=True)

class OrganisationManager(SoftDeleteManager):
    def get_queryset(self):
        return OrganisationQuerySet(self.model, using=self._db)
    
    def get_stats(self):
        return {
            'total': self.all_with_deleted().count(),
            'active': self.active().count(),
            'verified': self.verified().count()
        }

class StructureQuerySet(TenantAwareQuerySet):
    def roots(self):
        return self.filter(parent__isnull=True) if hasattr(self.model, 'parent') else self.filter(reports_to__isnull=True)
    
    def get_tree(self, tenant_id):
        table_name = self.model._meta.db_table
        parent_field = 'parent_id' if hasattr(self.model, 'parent') else 'reports_to_id'
        query = f"""
            WITH RECURSIVE tree AS (
                SELECT id, name, {parent_field}, tenant_id, 1 as level
                FROM {table_name}
                WHERE tenant_id = %s AND {parent_field} IS NULL
                UNION ALL
                SELECT t.id, t.name, t.{parent_field}, t.tenant_id, tr.level + 1
                FROM {table_name} t
                INNER JOIN tree tr ON t.{parent_field} = tr.id
                WHERE t.tenant_id = %s
            )
            SELECT * FROM tree ORDER BY level, name;
        """
        if 'position' in table_name:
             query = query.replace('name', 'title')

        with connection.cursor() as cursor:
            cursor.execute(query, [tenant_id, tenant_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

class StructureManager(SoftDeleteManager):
    def get_queryset(self):
        return StructureQuerySet(self.model, using=self._db)
    
    def get_full_tree(self, tenant_id):
        return self.get_queryset().get_tree(tenant_id)

class SubscriptionQuerySet(TenantAwareQuerySet):
    def active(self):
        now = timezone.now()
        return self.filter(status='ACTIVE', start_date__lte=now, end_date__gte=now)

class SubscriptionManager(TenantAwareManager):
    def get_queryset(self):
        return SubscriptionQuerySet(self.model, using=self._db)
    
    def is_active(self, tenant_id):
        return self.get_queryset().tenant(tenant_id).active().exists()

# --- NEW: Hierarchy & Team Managers ---

class HierarchyQuerySet(TenantAwareQuerySet):
    def for_supervisor(self, supervisor):
        return self.filter(supervisor=supervisor)
    
    def for_subordinate(self, subordinate):
        return self.filter(subordinate=subordinate)

class HierarchyManager(TenantAwareManager):
    def get_queryset(self):
        return HierarchyQuerySet(self.model, using=self._db)
    
    def get_subordinates(self, supervisor_id):
        return self.filter(supervisor_id=supervisor_id)

class TeamQuerySet(TenantAwareQuerySet):
    def in_department(self, department_id):
        return self.filter(department_id=department_id)

class TeamManager(TenantAwareManager):
    def get_queryset(self):
        return TeamQuerySet(self.model, using=self._db)
