import logging
import threading
from django.conf import settings

logger = logging.getLogger(__name__)


class OrganizationDatabaseRouter:
    _thread_local = threading.local()
    GLOBAL_APPS = [
        'django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes',
        'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles',
        'django.contrib.sites', 'axes', 'django_otp', 'celery', 'django_celery_beat',
        'django_celery_results', 'django_apscheduler', 'auditlog', 'health_check',
        'apps.core', 'apps.configs', 'apps.tenant'
    ]
    ORG_APPS = [
        'apps.accounts', 'apps.kpi', 'apps.dashboard', 'apps.reviews', 'apps.structure', 'apps.tasks_module',
    ]

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._cache = {}

    def _get_org_db(self, organization_id):
        from apps.tenant.models import Organization
        try:
            if organization_id in self._cache:
                return self._cache[organization_id]
            org = Organization.objects.get(id=organization_id)
            db_name = 'default'
            self._cache[organization_id] = db_name
            return db_name
        except Exception as e:
            self.logger.warning(f"Failed to get org DB: {e}")
        return 'default'

    def _get_current_org_id(self, model, **hints):
        """
        Resolve the current organisation/tenant ID from (in priority order):
          1. Explicit 'organization_id' hint passed by the caller
          2. Model instance attributes (tenant_id or organization_id)
          3. Thread-local set by TenantContextMiddleware for the current request
        """
        if getattr(self._thread_local, 'is_resolving', False):
            return None
        self._thread_local.is_resolving = True
        try:
            # Priority 1: explicit hint
            if 'organization_id' in hints:
                return hints['organization_id']

            # Priority 2: model instance carries the id
            if 'instance' in hints:
                instance = hints['instance']
                for attr in ('tenant_id', 'organization_id'):
                    val = getattr(instance, attr, None)
                    if val:
                        return str(val)

            # Priority 3: thread-local context (set per-request by middleware)
            try:
                from apps.tenant.context import get_current_tenant_id
                tid = get_current_tenant_id()
                if tid:
                    return tid
            except ImportError:
                pass

        finally:
            self._thread_local.is_resolving = False
        return None

    def db_for_read(self, model, **hints):
        app_label = model._meta.app_label
        if app_label in self.GLOBAL_APPS:
            return 'default'
        org_id = self._get_current_org_id(model, **hints)
        if org_id:
            return self._get_org_db(org_id)
        return 'default'

    def db_for_write(self, model, **hints):
        app_label = model._meta.app_label
        if app_label in self.GLOBAL_APPS:
            return 'default'
        org_id = self._get_current_org_id(model, **hints)
        if org_id:
            return self._get_org_db(org_id)
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        org1 = self._get_object_org(obj1)
        org2 = self._get_object_org(obj2)
        if org1 and org2 and str(org1) != str(org2):
            return False
        return True

    def _get_object_org(self, obj):
        """Safely get organization ID from an object"""
        if getattr(self._thread_local, 'is_resolving', False):
            return None
        
        self._thread_local.is_resolving = True
        try:
            # ✅ Check for organization_id directly
            if hasattr(obj, 'organization_id'):
                org_id = getattr(obj, 'organization_id', None)
                if org_id:
                    return org_id
            
            # ✅ Check for organization relation
            if hasattr(obj, 'organization'):
                org = getattr(obj, 'organization', None)
                if org and hasattr(org, 'id'):
                    return org.id
            
            # ✅ Check if object itself is an Organization
            if hasattr(obj, '_meta') and obj._meta.model_name == 'organization':
                if hasattr(obj, 'id'):
                    return obj.id
                    
        except Exception as e:
            self.logger.debug(f"Error getting object org: {e}")
        finally:
            self._thread_local.is_resolving = False
            
        return None


    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # If this thread is running a tenant migration, block all global apps
        if getattr(self._thread_local, 'is_tenant_migration', False):
            # Normalize app label to compare short name
            short_app = app_label.split('.')[-1]
            global_short_apps = {a.split('.')[-1] for a in self.GLOBAL_APPS}
            if short_app in global_short_apps or short_app in ['auth', 'contenttypes', 'sessions', 'admin', 'tenant', 'core', 'configs']:
                return False
            return True

        if app_label in self.GLOBAL_APPS:
            return db == 'default'
        if app_label in self.ORG_APPS:
            return db == 'default' or db.startswith('org_')
        return db == 'default'