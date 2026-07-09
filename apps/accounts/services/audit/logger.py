import logging
from typing import Optional, Dict, Any, List
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.accounts.models import AuditLog

logger = logging.getLogger(__name__)

class AuditService:

    def __init__(self):
        self._audit_queue = []

    def log(self, user, action: str, action_type: str, request=None, severity: str = 'info', metadata: Dict = None, old_value: Any = None, new_value: Any = None, content_type: str = None, object_id: str = None, object_repr: str = None, tenant_id: str = None) -> Optional[AuditLog]:
        if not action or not action_type:
            logger.warning(f"Attempted to create audit log without action or action_type")
            return None
        changes = {}
        if old_value is not None and new_value is not None:
            if isinstance(old_value, dict) and isinstance(new_value, dict):
                changes = self._compute_changes(old_value, new_value)

        log_data = {
            'user': user,
            'action': action,
            'action_type': action_type,
            'severity': severity,
            'metadata': metadata or {},
            'old_value': old_value,
            'new_value': new_value,
            'changes': changes,
            'content_type': content_type,
            'object_id': str(object_id) if object_id else None,
            'object_repr': (object_repr or '')[:500],
            'tenant_id': tenant_id or (user.tenant_id if user else None),
        }

        if request:
            log_data['ip_address'] = self._get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:2000]
            log_data['referer'] = request.META.get('HTTP_REFERER', '')[:500]
            log_data['request_method'] = request.method
            log_data['request_path'] = request.path[:500]
            session_obj = getattr(request, 'session', None)
            log_data['session_key'] = (session_obj.session_key if session_obj else '') or ''
        else:
            log_data['ip_address'] = '0.0.0.0'
            log_data['user_agent'] = 'system'
        transaction.on_commit(lambda: self._create_audit_log(log_data))
        return None

    def _create_audit_log(self, log_data: Dict) -> None:
        try:
            AuditLog.objects.create(**log_data)
            logger.debug(f"Audit log created: {log_data.get('action')} for user {log_data.get('user')}")
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}", exc_info=True)

    def log_login(self, user, request, success: bool = True, failure_reason: str = None) -> Optional[AuditLog]:
        return self.log(
            user=user if success else None,
            action='user.login',
            action_type='login',
            request=request,
            severity='info' if success else 'warning',
            metadata={
                'success': success,
                'failure_reason': failure_reason,
                'ip_address': self._get_client_ip(request) if request else '0.0.0.0'
            }
        )

    def log_logout(self, user, request) -> Optional[AuditLog]:
        return self.log(
            user=user,
            action='user.logout',
            action_type='logout',
            request=request,
            severity='info'
        )

    def log_create(self, user, obj, request=None, metadata: Dict = None) -> Optional[AuditLog]:
        return self.log(
            user=user,
            action=f'{obj._meta.model_name}.create',
            action_type='create',
            request=request,
            severity='info',
            metadata=metadata,
            content_type=f'{obj._meta.app_label}.{obj._meta.model_name}',
            object_id=str(obj.id),
            object_repr=str(obj)[:500]
        )

    def log_update(self, user, obj, old_value: Dict, new_value: Dict, request=None, metadata: Dict = None) -> Optional[AuditLog]:
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
            object_repr=str(obj)[:500]
        )

    def log_delete(self, user, obj, request=None, metadata: Dict = None) -> Optional[AuditLog]:
        return self.log(
            user=user,
            action=f'{obj._meta.model_name}.delete',
            action_type='delete',
            request=request,
            severity='warning',
            metadata=metadata,
            content_type=f'{obj._meta.app_label}.{obj._meta.model_name}',
            object_id=str(obj.id),
            object_repr=str(obj)[:500]
        )

    def log_security_event(self, user, action: str, request=None, severity: str = 'warning', metadata: Dict = None) -> Optional[AuditLog]:
        return self.log(
            user=user,
            action=f'security.{action}',
            action_type='security',
            request=request,
            severity=severity,
            metadata=metadata or {}
        )

    def log_permission_denied(self, user, permission: str, obj=None, request=None) -> Optional[AuditLog]:
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

    def log_mfa_event(self, user, event_type: str, success: bool, device_id: str = None, request=None) -> Optional[AuditLog]:
        return self.log(
            user=user,
            action=f'mfa.{event_type}',
            action_type='security',
            request=request,
            severity='info' if success else 'warning',
            metadata={
                'event_type': event_type,
                'success': success,
                'device_id': device_id
            }
        )

    def _compute_changes(self, old: Dict, new: Dict) -> Dict[str, Dict]:
        changes = {}
        all_keys = set(old.keys()) | set(new.keys())
        for key in all_keys:
            old_val = old.get(key)
            new_val = new.get(key)
            if old_val != new_val:
                changes[key] = {
                    'old': self._serialize_value(old_val),
                    'new': self._serialize_value(new_val)
                }
        return changes

    def _serialize_value(self, value: Any) -> Any:
        if hasattr(value, 'id'):
            return str(value.id)
        if hasattr(value, '__str__'):
            return str(value)
        return value

    def _get_client_ip(self, request) -> str:
        if not request:
            return '0.0.0.0'
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()

        return request.META.get('REMOTE_ADDR', '0.0.0.0')

audit_service = AuditService()