# apps/reportplt/api/v1/decorators/audit_log.py
import json
import logging
from functools import wraps
from typing import Optional, Callable, Dict, Any
from django.http import JsonResponse
from django.utils import timezone
from apps.reportplt.models import ReportAudit
from apps.reportplt.constants import AuditAction

logger = logging.getLogger(__name__)

def audit_log(action: str = AuditAction.VIEW, detail_fields: Optional[list] = None, log_request: bool = False):
    """
    Decorator to log audit entries for report operations.
    
    Args:
        action: Audit action type
        detail_fields: Fields to extract from request/response for details
        log_request: Whether to log request data
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            user = request.user if request.user.is_authenticated else None
            tenant_id = getattr(request, 'tenant_id', None) or getattr(request, 'report_context', {}).get('tenant_id')
            start_time = timezone.now()
            success = True
            error_message = ''
            report = None
            dashboard = None
            try:
                response = func(self, request, *args, **kwargs)
                if hasattr(response, 'status_code') and response.status_code >= 400:
                    success = False
                report = kwargs.get('report_id') or getattr(request, 'report_id', None)
                dashboard = kwargs.get('dashboard_id') or getattr(request, 'dashboard_id', None)
                return response
            except Exception as e:
                success = False
                error_message = str(e)
                raise
            finally:
                duration = (timezone.now() - start_time).total_seconds()
                try:
                    details = _build_details(request, response, detail_fields, log_request) if success else {'error': error_message}
                    if report:
                        from apps.reportplt.models import Report
                        try:
                            report_obj = Report.objects.get(id=report)
                            report = report_obj
                        except:
                            pass
                    ReportAudit.log_action(
                        user=user,
                        action=action,
                        report=report,
                        dashboard=dashboard,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        details=details,
                        success=success,
                        error_message=error_message,
                    )
                    logger.info(f"Audit log: {action} by {user} - success={success}")
                except Exception as e:
                    logger.error(f"Failed to log audit: {str(e)}")
        return wrapper
    return decorator

def audit_action(action: str = 'view', resource_type: str = 'report'):
    """
    Simplified audit decorator for specific actions.
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            response = func(self, request, *args, **kwargs)
            try:
                user = request.user if request.user.is_authenticated else None
                report_id = kwargs.get('report_id') or getattr(request, 'report_id', None)
                if report_id:
                    from apps.reportplt.models import Report
                    try:
                        report = Report.objects.get(id=report_id)
                        ReportAudit.log_action(
                            user=user,
                            action=action,
                            report=report,
                            ip_address=request.META.get('REMOTE_ADDR'),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            details={'resource_type': resource_type, 'status_code': response.status_code},
                            success=response.status_code < 400
                        )
                    except Exception as e:
                        logger.warning(f"Audit log failed: {str(e)}")
            except Exception as e:
                logger.warning(f"Failed to log audit action: {str(e)}")
            return response
        return wrapper
    return decorator

def log_report_access(func: Callable):
    """
    Decorator specifically for logging report access (view/generate/export).
    """
    @wraps(func)
    def wrapper(self, request, *args, **kwargs):
        report_id = kwargs.get('report_id') or getattr(request, 'report_id', None)
        if report_id:
            try:
                from apps.reportplt.models import Report
                report = Report.objects.get(id=report_id)
                action = AuditAction.VIEW
                if 'export' in request.path:
                    action = AuditAction.EXPORT
                elif 'generate' in request.path:
                    action = AuditAction.GENERATE
                user = request.user if request.user.is_authenticated else None
                ReportAudit.log_action(
                    user=user,
                    action=action,
                    report=report,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details={'path': request.path, 'method': request.method}
                )
            except Exception as e:
                logger.warning(f"Failed to log report access: {str(e)}")
        return func(self, request, *args, **kwargs)
    return wrapper

def _build_details(request, response, detail_fields: Optional[list], log_request: bool) -> Dict[str, Any]:
    details = {}
    if detail_fields:
        for field in detail_fields:
            if field in kwargs:
                details[field] = kwargs[field]
            elif hasattr(request, field):
                details[field] = getattr(request, field)
    if log_request:
        details['request_path'] = request.path
        details['request_method'] = request.method
        if request.GET:
            details['query_params'] = dict(request.GET)
    if hasattr(response, 'status_code'):
        details['status_code'] = response.status_code
    return details