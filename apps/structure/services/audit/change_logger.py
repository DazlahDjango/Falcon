from typing import Dict, Any, Optional, List
from uuid import UUID
from django.utils import timezone
from django.core.cache import cache
import json

class ChangeLoggerService:
    def __init__(self):
        self._audit_model = None
    
    def _get_audit_model(self):
        if self._audit_model is None:
            from django.contrib.contenttypes.models import ContentType
            from django.apps import apps
            try:
                self._audit_model = apps.get_model('auditlog', 'LogEntry')
            except LookupError:
                self._audit_model = None
        return self._audit_model
    
    def log_change(self, tenant_id: UUID, user_id: UUID, action: str, model_name: str, object_id: str, object_repr: str, changes: Dict[str, Any], ip_address: str = None, user_agent: str = None) -> None:
        AuditLog = self._get_audit_model()
        if AuditLog:
            from django.contrib.contenttypes.models import ContentType
            try:
                app_label, model = model_name.split('.')
                content_type = ContentType.objects.get(app_label=app_label, model=model.lower())
            except (ValueError, ContentType.DoesNotExist):
                content_type = None
            log_entry = AuditLog(
                content_type=content_type,
                object_id=object_id,
                object_repr=object_repr,
                action=action,
                changes=json.dumps(changes),
                actor_id=str(user_id) if user_id else None,
                timestamp=timezone.now(),
                additional_data={
                    'tenant_id': str(tenant_id),
                    'ip_address': ip_address,
                    'user_agent': user_agent
                }
            )
            log_entry.save()
        else:
            cache_key = f"audit_pending:{tenant_id}:{timezone.now().timestamp()}"
            pending_log = {
                'tenant_id': str(tenant_id),
                'user_id': str(user_id) if user_id else None,
                'action': action,
                'model_name': model_name,
                'object_id': object_id,
                'object_repr': object_repr,
                'changes': changes,
                'timestamp': timezone.now().isoformat(),
                'ip_address': ip_address,
                'user_agent': user_agent
            }
            cache.set(cache_key, pending_log, 3600)
    
    def log_department_change(self, tenant_id: UUID, user_id: UUID, department_id: UUID, action: str, changes: Dict[str, Any], **kwargs) -> None:
        from ...models.department import Department
        dept = Department.objects.filter(id=department_id).first()
        dept_repr = f"{dept.code} - {dept.name}" if dept else str(department_id)
        self.log_change(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            model_name='structure.Department',
            object_id=str(department_id),
            object_repr=dept_repr,
            changes=changes,
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )
    
    def log_team_change(self, tenant_id: UUID, user_id: UUID, team_id: UUID, action: str, changes: Dict[str, Any], **kwargs) -> None:
        from ...models.team import Team
        team = Team.objects.filter(id=team_id).first()
        team_repr = f"{team.code} - {team.name}" if team else str(team_id)
        self.log_change(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            model_name='structure.Team',
            object_id=str(team_id),
            object_repr=team_repr,
            changes=changes,
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )
    
    def log_employment_change(self, tenant_id: UUID, user_id: UUID, user_target_id: UUID, action: str, changes: Dict[str, Any], **kwargs) -> None:
        self.log_change(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            model_name='structure.Employment',
            object_id=str(user_target_id),
            object_repr=f"User {user_target_id}",
            changes=changes,
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )
    
    def get_audit_trail(self, tenant_id: UUID, object_id: Optional[str] = None, model_name: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        AuditLog = self._get_audit_model()
        if not AuditLog:
            return []
        from django.contrib.contenttypes.models import ContentType
        queryset = AuditLog.objects.filter(additional_data__tenant_id=str(tenant_id))
        if object_id and model_name:
            try:
                app_label, model = model_name.split('.')
                content_type = ContentType.objects.get(app_label=app_label, model=model.lower())
                queryset = queryset.filter(content_type=content_type, object_id=object_id)
            except (ValueError, ContentType.DoesNotExist):
                pass
        logs = queryset.order_by('-timestamp')[:limit]
        return [
            {
                'id': log.id,
                'action': log.action,
                'object_repr': log.object_repr,
                'changes': json.loads(log.changes) if log.changes else {},
                'actor_id': log.actor_id,
                'timestamp': log.timestamp.isoformat(),
                'additional_data': log.additional_data
            }
            for log in logs
        ]