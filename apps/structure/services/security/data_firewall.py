from typing import Dict, Any, List
from uuid import UUID
from django.core.cache import cache
from apps.structure.models.employment import Employment

class DataFirewallService:
    def __init__(self):
        self._cache = cache
    
    def validate_tenant_access(self, requested_tenant_id: UUID, user_tenant_id: UUID) -> bool:
        return str(requested_tenant_id) == str(user_tenant_id)
    
    def validate_cross_org_access(self, user_id: UUID, source_unit_id: UUID, target_unit_id: UUID, tenant_id: UUID) -> bool:
        if source_unit_id == target_unit_id:
            return True
        if self._is_executive(user_id, tenant_id):
            return True
        if self._has_cross_org_permission(user_id, tenant_id):
            return True
        return False
    
    def filter_sensitive_data(self, user_id: UUID, tenant_id: UUID, data: Dict[str, Any], sensitivity_level: str) -> Dict[str, Any]:
        user_clearance = self._get_user_clearance(user_id, tenant_id)
        sensitivity_order = ['public', 'internal', 'confidential', 'restricted']
        if sensitivity_order.index(sensitivity_level) <= sensitivity_order.index(user_clearance):
            return data
        return self._redact_sensitive_fields(data)
    
    def _redact_sensitive_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        redacted = {}
        sensitive_fields = ['salary', 'ssn', 'tax_id', 'bank_account', 'personal_email', 'phone_number', 'address']
        for key, value in data.items():
            if key.lower() in sensitive_fields:
                redacted[key] = '[REDACTED]'
            elif isinstance(value, dict):
                redacted[key] = self._redact_sensitive_fields(value)
            elif isinstance(value, list):
                redacted[key] = [self._redact_sensitive_fields(item) if isinstance(item, dict) else item for item in value]
            else:
                redacted[key] = value
        return redacted
    
    def _get_user_clearance(self, user_id: UUID, tenant_id: UUID) -> str:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return 'public'
        if employment.is_executive or employment.is_board_member:
            return 'restricted'
        if employment.is_manager:
            return 'confidential'
        return 'internal'
    
    def _is_executive(self, user_id: UUID, tenant_id: UUID) -> bool:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        return employment.is_executive if employment else False
    
    def _has_cross_org_permission(self, user_id: UUID, tenant_id: UUID) -> bool:
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return False
        return employment.is_manager or employment.is_executive