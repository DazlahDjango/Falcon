import logging
from typing import Optional, Dict, Any
from django.utils import timezone
from django.http import HttpRequest
from ...models import BillingAuditLog
from ...utils import serialize_for_audit

logger = logging.getLogger(__name__)


class AuditLogger:
    def log(self, user, tenant_id: str, action: str, resource_type: str,
            resource_id: str, before: Optional[Dict] = None,
            after: Optional[Dict] = None, success: bool = True,
            error_message: str = None, reason: str = None,
            metadata: Optional[Dict] = None, request: Optional[HttpRequest] = None):
        """
        Log a billing audit event.
        """
        try:
            audit_log = BillingAuditLog()
            
            # User info
            if user:
                audit_log.user_id = user.id if hasattr(user, 'id') else str(user)
                audit_log.user_email = user.email if hasattr(user, 'email') else str(user)
                audit_log.user_role = user.role if hasattr(user, 'role') else ''
            else:
                audit_log.user_email = 'system'
            
            # Request context
            if request:
                audit_log.user_ip = self._get_client_ip(request)
                audit_log.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
            
            # Core fields
            audit_log.tenant_id = tenant_id
            audit_log.action = action
            audit_log.resource_type = resource_type
            audit_log.resource_id = str(resource_id)
            audit_log.before = before or {}
            audit_log.after = after or {}
            audit_log.success = success
            audit_log.error_message = error_message or ''
            audit_log.reason = reason or ''
            audit_log.metadata = metadata or {}
            
            # Calculate changes
            if before and after:
                changes = {}
                all_keys = set(before.keys()) | set(after.keys())
                for key in all_keys:
                    if before.get(key) != after.get(key):
                        changes[key] = {
                            'before': before.get(key),
                            'after': after.get(key)
                        }
                audit_log.changes = changes
            
            audit_log.save()
            logger.info(f"Audit log created: {user} - {action} - {resource_type}")
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
    
    def log_model_change(self, user, instance, action: str,
                         before_state: Optional[Dict] = None,
                         request: Optional[HttpRequest] = None,
                         metadata: Optional[Dict] = None):
        """
        Log a model change with automatic state capture.
        """
        after_state = serialize_for_audit(instance)
        
        self.log(
            user=user,
            tenant_id=instance.tenant_id if hasattr(instance, 'tenant_id') else None,
            action=action,
            resource_type=instance.__class__.__name__.lower(),
            resource_id=instance.id,
            before=before_state,
            after=after_state,
            metadata=metadata,
            request=request
        )
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Singleton instance
audit_logger = AuditLogger()