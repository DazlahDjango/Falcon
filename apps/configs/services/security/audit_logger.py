import logging
from django.utils import timezone
from apps.configs.models import ConfigAuditLog
from apps.configs.constants import AuditResult

class AuditLogger:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def log(self, action, performed_by, performed_by_role, performed_by_email='', ip_address=None, user_agent='', target_app=None, target_id='', details=None, result=AuditResult.PENDING, error_message='', request_id=''):
        try:
            log_entry = ConfigAuditLog.objects.create(
                action=action,
                performed_by=performed_by,
                performed_by_role=performed_by_role,
                performed_by_email=performed_by_email,
                ip_address=ip_address,
                user_agent=user_agent[:500] if user_agent else '',
                target_app=target_app,
                target_id=target_id,
                details=details or {},
                result=result,
                error_message=error_message[:1000] if error_message else '',
                request_id=request_id,
            )
            return log_entry
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to write audit log: {e}")
            return None
    def log_success(self, action, performed_by, performed_by_role, **kwargs):
        return self.log(action, performed_by, performed_by_role, result=AuditResult.SUCCESS, **kwargs)
    def log_failure(self, action, performed_by, performed_by_role, error_message='', **kwargs):
        return self.log(action, performed_by, performed_by_role, result=AuditResult.FAILURE, error_message=error_message, **kwargs)