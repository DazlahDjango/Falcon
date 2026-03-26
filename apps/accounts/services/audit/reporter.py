import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from django.db.models import Count, Q
from django.utils import timezone
from apps.accounts.models import AuditLog, User
from apps.accounts.services.authorization.tenant_access import TenantAccessService
logger = logging.getLogger(__name__)

class AuditReporterService:
    def __init__(self):
        self.tenant_service = TenantAccessService()
    
    def get_user_activity(self, user_id: str, days: int = 30) -> List[Dict]:
        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(
            user_id=user_id,
            timestamp__gte=cutoff
        ).order_by('-timestamp')
        return self._serialize_logs(logs)
    
    def get_user_activity_summary(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(user_id=user_id, timestamp__gte=cutoff)
        action_counts = logs.values('action_type').annotate(count=Count('id'))
        daily_counts = logs.extra({'date': "date(timestamp)"}).values('date').annotate(count=Count('id'))
        return {
            'user_id': user_id,
            'period_days': days,
            'total_actions': logs.count(),
            'action_counts': list(action_counts),
            'daily_activity': list(daily_counts),
            'last_activity': logs.first().timestamp if logs.exists() else None
        }
    
    def get_tenant_activity(self, tenant_id: str, days: int = 30) -> Dict[str, Any]:
        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(tenant_id=tenant_id, timestamp__gte=cutoff)
        active_users = logs.values('user__email', 'user__first_name', 'user__last_name')\
            .annotate(action_count=Count('id')).order_by('-action_count')[:10]
        top_actions = logs.values('action').annotate(count=Count('id')).order_by('-count')[:10]
        daily_counts = logs.extra({'date': "date(timestamp)"}).values('date').annotate(count=Count('id'))
        return {
            'tenant_id': tenant_id,
            'period_days': days,
            'total_actions': logs.count(),
            'active_users': list(active_users),
            'top_actions': list(top_actions),
            'daily_activity': list(daily_counts)
        }
    
    def get_security_events(self, tenant_id: str = None, days: int = 30) -> List[Dict]:
        cutoff = timezone.now() - timedelta(days=days)
        qs = AuditLog.objects.filter(
            Q(severity__in=['warning', 'error', 'critical']) |
            Q(action_type='security'),
            timestamp__gte=cutoff
        )
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return self._serialize_logs(qs.order_by('-timestamp'))
    
    def get_object_history(self, content_type: str, object_id: str) -> List[Dict]:
        logs = AuditLog.objects.filter(
            content_type=content_type,
            object_id=object_id
        ).order_by('timestamp')
        
        return self._serialize_logs(logs)
    
    def export_audit_logs(self, tenant_id: str, start_date: datetime, end_date: datetime, format: str = 'json') -> Dict[str, Any]:
        logs = AuditLog.objects.filter(
            tenant_id=tenant_id,
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).order_by('timestamp')
        return {
            'tenant_id': tenant_id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'count': logs.count(),
            'logs': self._serialize_logs(logs)
        }
    
    def get_compliance_report(self, tenant_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        logs = AuditLog.objects.filter(
            tenant_id=tenant_id,
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        )
        total_actions = logs.count()
        unique_users = logs.values('user_id').distinct().count()
        critical_events = logs.filter(severity='critical').count()
        action_breakdown = logs.values('action_type').annotate(count=Count('id'))
        user_activity = logs.values('user__email', 'user__first_name', 'user__last_name')\
            .annotate(action_count=Count('id')).order_by('-action_count')[:20]
        daily_activity = logs.extra({'date': "date(timestamp)"})\
            .values('date').annotate(count=Count('id')).order_by('date')
        return {
            'tenant_id': tenant_id,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'summary': {
                'total_actions': total_actions,
                'unique_users': unique_users,
                'critical_events': critical_events,
                'average_daily_actions': total_actions / max((end_date - start_date).days, 1)
            },
            'action_breakdown': list(action_breakdown),
            'top_users': list(user_activity),
            'daily_activity': list(daily_activity)
        }
    
    def _serialize_logs(self, logs) -> List[Dict]:
        return [
            {
                'id': str(log.id),
                'user_email': log.user.email if log.user else None,
                'action': log.action,
                'action_type': log.action_type,
                'severity': log.severity,
                'ip_address': log.ip_address,
                'content_type': log.content_type,
                'object_id': log.object_id,
                'object_repr': log.object_repr,
                'changes': log.changes,
                'metadata': log.metadata,
                'timestamp': log.timestamp.isoformat(),
                'created_at': log.created_at.isoformat()
            }
            for log in logs
        ]