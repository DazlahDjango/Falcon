import logging
from typing import Optional, Dict, Any
from django.utils import timezone
from apps.accounts.models import AuditLog
from apps.accounts.services.authorization.tenant_access import TenantAccessService
logger = logging.getLogger(__name__)

class AuditService:
    def __init__(self):
        self.tenant_service = TenantAccessService()
    
    def log(self, user, action: str, action_type: str, request=None, severity: str = 'info', metadata: Dict = None, old_value: Any = None, new_value: Any = None, content_type: str = None, object_id: str = None, object_repr: str = None) -> AuditLog:
        changes = {}
        if old_value is not None and new_value is not None:
            if isinstance(old_value, dict) and isinstance(new_value, dict):
                changes = self._compute_changes(old_value, new_value)
        
        return AuditLog.log(
            user=user,
            action=action,
            action_type=action_type,
            request=request,
            severity=severity,
            metadata=metadata or {},
            old_value=old_value,
            new_value=new_value,
            changes=changes,
            content_type=content_type,
            object_id=object_id,
            object_repr=object_repr
        )
    
    def log_login(self, user, request, success: bool = True, failure_reason: str = None):
        return self.log(
            user=user if success else None,
            action='user.login',
            action_type='login',
            request=request,
            severity='info' if success else 'warning',
            metadata={
                'success': success,
                'failure_reason': failure_reason,
                'ip_address': self._get_client_ip(request)
            }
        )
    
    def log_logout(self, user, request):
        return self.log(
            user=user,
            action='user.logout',
            action_type='logout',
            request=request,
            severity='info'
        )
    
    def log_create(self, user, obj, request=None, metadata: Dict = None):
        return self.log(
            user=user,
            action=f'{obj._meta.model_name}.create',
            action_type='create',
            request=request,
            severity='info',
            metadata=metadata,
            content_type=f'{obj._meta.app_label}.{obj._meta.model_name}',
            object_id=str(obj.id),
            object_repr=str(obj)
        )
    
    def log_update(self, user, obj, old_value: Dict, new_value: Dict, request=None, metadata: Dict = None):
        return self.log(
            user=user,
            action=f'{obj._meta.model_name}.update',
            action_type='update',
            request=request,
            severity='info',
            metadata=metadata,
            old_value=old_value,
            new_value=new_value,
            content_type=f'{obj._meta.app_label}.{obj._meta.model_name}',
            object_id=str(obj.id),
            object_repr=str(obj)
        )
    
    def log_delete(self, user, obj, request=None, metadata: Dict = None):
        return self.log(
            user=user,
            action=f'{obj._meta.model_name}.delete',
            action_type='delete',
            request=request,
            severity='warning',
            metadata=metadata,
            content_type=f'{obj._meta.app_label}.{obj._meta.model_name}',
            object_id=str(obj.id),
            object_repr=str(obj)
        )
    
    def log_security_event(self, user, action: str, request=None, severity: str = 'warning', metadata: Dict = None):
        return self.log(
            user=user,
            action=action,
            action_type='security',
            request=request,
            severity=severity,
            metadata=metadata
        )
    
    def log_permission_denied(self, user, permission: str, obj=None, request=None):
        metadata = {'permission': permission}
        if obj:
            metadata['object_type'] = f'{obj._meta.app_label}.{obj._meta.model_name}'
            metadata['object_id'] = str(obj.id)
        return self.log(
            user=user,
            action='permission.denied',
            action_type='security',
            request=request,
            severity='warning',
            metadata=metadata
        )
    
    def _compute_changes(self, old: Dict, new: Dict) -> Dict[str, Dict]:
        changes = {}
        all_keys = set(old.keys()) | set(new.keys())
        for key in all_keys:
            old_val = old.get(key)
            new_val = new.get(key)
            if old_val != new_val:
                changes[key] = {
                    'old': old_val,
                    'new': new_val
                }
        return changes
    
    def _get_client_ip(self, request) -> str:
        if not request:
            return ''
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')