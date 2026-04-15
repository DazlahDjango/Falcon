from rest_framework.throttling import SimpleRateThrottle
from apps.accounts.api.v1.throttles import UserRateThrottle, AnonRateThrottle

class CalculationThrottle(UserRateThrottle):
    rate = '10/hour'
    scope = 'calculations'

class BulkUploadThrottle(UserRateThrottle):
    rate = '5/minute'
    scope = 'bulk_upload'

class DashboardThrottle(UserRateThrottle):
    rate = '100/minute'
    scope = 'dashboard'

class RecalculationThrottle(UserRateThrottle):
    rate = '20/hour'
    scope = 'recalculation'

class KPIListThrottle(UserRateThrottle):
    rate = '60/minute'
    scope = 'kpi_list'

class AnonKPIThrottle(AnonRateThrottle):
    rate = '20/hour'
    scope = 'anon_kpi'

class TenantCalculationThrottle(SimpleRateThrottle):
    scope = 'tenant_calculations'
    def get_cache_key(self, request, view):
        tenant_id = getattr(request, 'tenant_id', 'unknown')
        return self.cache_format % {
            'scope': self.scope,
            'ident': tenant_id
        }

class IPBasedThrottle(SimpleRateThrottle):
    scope = 'ip_based'
    def get_cache_key(self, request, view):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return self.cache_format % {
            'scope': self.scope,
            'ident': ip
        }

class BurstThrottle(UserRateThrottle):
    rate = '30/minute'
    scope = 'burst'

class SustainedThrottle(UserRateThrottle):
    rate = '500/day'
    scope = 'sustained'

class ComplexCalculationThrottle(UserRateThrottle):
    rate = '5/hour'
    scope = 'complex_calc'

class ExportThrottle(UserRateThrottle):
    rate = '10/hour'
    scope = 'export'