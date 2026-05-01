from rest_framework.throttling import SimpleRateThrottle, AnonRateThrottle
from apps.accounts.api.v1.throttles import UserRateThrottle
from django.utils.translation import gettext_lazy as _

class DepartmentRateThrottle(UserRateThrottle):
    scope = 'department'
    rate = '100/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_department_{tenant_id}_{request.user.id}"
        return None

class TeamRateThrottle(UserRateThrottle):
    scope = 'team'
    rate = '100/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_team_{tenant_id}_{request.user.id}"
        return None

class EmploymentRateThrottle(UserRateThrottle):
    scope = 'employment'
    rate = '50/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_employment_{tenant_id}_{request.user.id}"
        return None

class ReportingRateThrottle(UserRateThrottle):
    scope = 'reporting'
    rate = '50/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_reporting_{tenant_id}_{request.user.id}"
        return None

class HierarchyReadThrottle(UserRateThrottle):
    scope = 'hierarchy_read'
    rate = '500/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_hierarchy_read_{tenant_id}_{request.user.id}"
        return f"throttle_hierarchy_read_anon_{self.get_ident(request)}"

class HierarchyWriteThrottle(UserRateThrottle):
    scope = 'hierarchy_write'
    rate = '50/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_hierarchy_write_{tenant_id}_{request.user.id}"
        return None

class OrgChartExportThrottle(UserRateThrottle):
    scope = 'org_chart_export'
    rate = '20/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_org_chart_{tenant_id}_{request.user.id}"
        return None


class BulkOperationThrottle(UserRateThrottle):
    scope = 'bulk_operation'
    rate = '10/hour'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_bulk_{tenant_id}_{request.user.id}"
        return None


class StructureBurstThrottle(UserRateThrottle):
    scope = 'structure_burst'
    rate = '30/minute'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"throttle_burst_{request.user.id}"
        return f"throttle_burst_anon_{self.get_ident(request)}"

class StructureSustainedThrottle(UserRateThrottle):
    scope = 'structure_sustained'
    rate = '1000/day'
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            tenant_id = getattr(request.user, 'tenant_id', None)
            return f"throttle_sustained_{tenant_id}_{request.user.id}"
        return f"throttle_sustained_anon_{self.get_ident(request)}"