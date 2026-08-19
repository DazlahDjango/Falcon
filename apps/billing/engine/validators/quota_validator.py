import logging
from typing import Tuple, Optional, Dict, Any
from django.core.exceptions import ValidationError
from apps.billing.constants import QuotaResource
from apps.billing.services.usage.service import UsageTrackingService as QuotaService
logger = logging.getLogger(__name__)

class QuotaValidator:
    def __init__(self, tenant=None):
        self.tenant = tenant
        self.quota_service = QuotaService()
    
    def validate_user_creation(self, tenant, is_admin: bool = False) -> Tuple[bool, Optional[str]]:
        is_available, current, max_limit, message = self.quota_service.check_quota(
            tenant, QuotaResource.USERS
        )
        if not is_available:
            return False, f"User limit reached. Maximum {max_limit} users."
        if is_admin:
            is_available, current, max_limit, message = self.quota_service.check_quota(
                tenant, QuotaResource.ADMINS
            )
            if not is_available:
                return False, f"Admin limit reached. Maximum {max_limit} admins."
        return True, None
    
    def validate_kpi_creation(self, tenant, quantity: int = 1) -> Tuple[bool, Optional[str]]:
        is_available, current, max_limit, message = self.quota_service.check_quota(
            tenant, QuotaResource.KPIS, requested_amount=quantity
        )
        if not is_available:
            return False, f"KPI limit reached. Maximum {max_limit} KPIs."
        return True, None
    
    def validate_storage_usage(self, tenant, additional_mb: int) -> Tuple[bool, Optional[str]]:
        is_available, current, max_limit, message = self.quota_service.check_quota(
            tenant, QuotaResource.STORAGE_MB, requested_amount=additional_mb
        )
        if not is_available:
            return False, f"Storage limit reached. Maximum {max_limit} MB."
        return True, None
    
    def validate_api_call(self, tenant) -> Tuple[bool, Optional[str]]:
        is_available, current, max_limit, message = self.quota_service.check_quota(
            tenant, QuotaResource.API_CALLS
        )
        if not is_available:
            return False, f"Daily API call limit reached. Maximum {max_limit} calls per day."
        return True, None
    
    def validate_bulk_operation(self, tenant, resource: str, requested_count: int) -> Tuple[bool, Optional[str]]:
        resource_map = {
            'users': QuotaResource.USERS,
            'kpis': QuotaResource.KPIS,
        }
        if resource not in resource_map:
            return True, None
        is_available, current, max_limit, message = self.quota_service.check_quota(
            tenant, resource_map[resource], requested_amount=requested_count
        )
        if not is_available:
            return False, f"Bulk operation exceeds {resource} limit. Maximum {max_limit}."
        return True, None
    
    def get_quota_status(self, tenant) -> Dict[str, Any]:
        return self.quota_service.get_quota_status(tenant)
    
    def enforce_quota_or_raise(self, tenant, resource: str, requested_amount: int = 1):
        is_valid, error_message = None, None
        if resource == QuotaResource.USERS:
            is_valid, error_message = self.validate_user_creation(tenant)
        elif resource == QuotaResource.ADMINS:
            is_valid, error_message = self.validate_user_creation(tenant, is_admin=True)
        elif resource == QuotaResource.KPIS:
            is_valid, error_message = self.validate_kpi_creation(tenant, requested_amount)
        elif resource == QuotaResource.STORAGE_MB:
            is_valid, error_message = self.validate_storage_usage(tenant, requested_amount)
        elif resource == QuotaResource.API_CALLS:
            is_valid, error_message = self.validate_api_call(tenant)
        else:
            return
        if not is_valid:
            raise ValidationError(error_message)