import logging
import threading
from apps.tenant.exceptions import IsolationError

logger = logging.getLogger(__name__)


class IsolationEnforcer:
    _thread_local = threading.local()

    def __init__(self, request=None):
        self.request = request
        self.logger = logging.getLogger(__name__)

    def validate_access(self, requested_org_id, user=None):
        if not requested_org_id:
            raise IsolationError("No organization specified")
        if user is None and self.request:
            user = self.request.user
        if not user or not user.is_authenticated:
            return True
        user_org_id = self._get_user_org_id(user)
        if user_org_id and str(user_org_id) != str(requested_org_id):
            self.logger.warning(f"Isolation violation: User {user.id} attempted org {requested_org_id} but belongs to {user_org_id}")
            raise IsolationError(f"Access denied: User does not belong to organization {requested_org_id}")
        return True

    def _get_user_org_id(self, user):
        if hasattr(user, 'organization_id') and user.organization_id:
            return user.organization_id
        if hasattr(user, 'organization') and user.organization:
            return user.organization.id
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return user.tenant_id
        return None

    def enforce_query_filter(self, queryset, organization_id):
        current = self._extract_org_from_queryset(queryset)
        if current and str(current) != str(organization_id):
            raise IsolationError(f"Query isolation violation: Queryset filtered for org {current}, access requested for org {organization_id}")
        if not current:
            return queryset.filter(organization_id=organization_id)
        return queryset

    def _extract_org_from_queryset(self, queryset):
        try:
            query = str(queryset.query)
            if '"organization_id"' in query or 'organization_id' in query:
                import re
                match = re.search(r'organization_id\s*=\s*([a-f0-9\-]+)', query)
                if match:
                    return match.group(1)
        except Exception:
            pass
        return None

    def validate_cross_operation(self, source_org_id, target_org_id):
        if source_org_id and target_org_id and str(source_org_id) != str(target_org_id):
            self.logger.error(f"Cross-org operation blocked: {source_org_id} -> {target_org_id}")
            raise IsolationError(f"Cross-organization operations not allowed: {source_org_id} cannot access {target_org_id}")
        return True

    def get_scope_filter(self, organization_id):
        return {'organization_id': organization_id}

    def assert_org_context(self, obj, expected_org_id):
        obj_org = self._get_object_org(obj)
        if obj_org and str(obj_org) != str(expected_org_id):
            raise IsolationError(f"Object {obj._meta.model_name}.{obj.id} belongs to org {obj_org}, operation requested for org {expected_org_id}")

    def _get_object_org(self, obj):
        if hasattr(obj, 'organization_id') and obj.organization_id:
            return obj.organization_id
        if hasattr(obj, 'organization') and obj.organization:
            return obj.organization.id
        if hasattr(obj, 'tenant_id') and obj.tenant_id:
            return obj.tenant_id
        return None

    def is_safe_reference(self, from_obj, to_obj):
        from_org = self._get_object_org(from_obj)
        to_org = self._get_object_org(to_obj)
        if not from_org or not to_org:
            return True
        return str(from_org) == str(to_org)

    def set_thread_org_context(self, organization_id):
        self._thread_local.current_org_id = organization_id

    def get_thread_org_context(self):
        return getattr(self._thread_local, 'current_org_id', None)

    def clear_thread_org_context(self):
        if hasattr(self._thread_local, 'current_org_id'):
            delattr(self._thread_local, 'current_org_id')