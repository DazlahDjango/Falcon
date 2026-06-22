from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import PIP, PIPAction
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService

class PIPService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_pip(employee, owner, review_cycle, data):
        existing_active = PIP.objects.filter(employee=employee, status__in=['draft', 'submitted']).exists()
        if existing_active:
            raise ValidationError("Employee already has an active PIP")
        pip = PIP.objects.create(tenant_id=employee.tenant_id, employee=employee, owner=owner, review_cycle=review_cycle, title=data.get('title'), description=data.get('description'), severity=data.get('severity', 'moderate'), start_date=data.get('start_date'), end_date=data.get('end_date'), improvement_areas=data.get('improvement_areas'), success_criteria=data.get('success_criteria'), consequences_if_failed=data.get('consequences_if_failed'), consequences_if_successful=data.get('consequences_if_successful', ''), status='draft')
        if 'actions' in data:
            for action_data in data['actions']:
                PIPAction.objects.create(pip=pip, title=action_data['title'], description=action_data.get('description', ''), priority=action_data.get('priority', 'medium'), due_date=action_data['due_date'], requires_evidence=action_data.get('requires_evidence', False))
        NotificationService.notify_pip_created(pip)
        return pip
    @staticmethod
    def get_pip(pip_id):
        try:
            return PIP.objects.get(id=pip_id)
        except PIP.DoesNotExist:
            return None
    @staticmethod
    def get_employee_pips(employee, status=None):
        queryset = PIP.objects.filter(employee=employee)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at')
    @staticmethod
    def get_manager_pips(manager, status=None):
        queryset = PIP.objects.filter(owner=manager)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-created_at')
    @staticmethod
    def get_active_pips_for_tenant(tenant):
        return PIP.objects.filter(tenant_id=tenant.id, status__in=['draft', 'submitted']).select_related('employee', 'owner')
    @staticmethod
    @BaseReviewService.atomic_operation
    def update_pip(pip_id, data):
        pip = PIP.objects.get(id=pip_id)
        if pip.status in ['completed', 'approved']:
            raise ValidationError("Cannot update completed or approved PIP")
        updatable_fields = ['title', 'description', 'severity', 'improvement_areas', 'success_criteria', 'consequences_if_failed', 'consequences_if_successful']
        for field in updatable_fields:
            if field in data:
                setattr(pip, field, data[field])
        if 'extended_to_date' in data:
            pip.extended_to_date = data['extended_to_date']
            pip.extension_reason = data.get('extension_reason', '')
        pip.save()
        return pip
    @staticmethod
    @BaseReviewService.atomic_operation
    def complete_pip(pip_id, outcome, notes=None):
        pip = PIP.objects.get(id=pip_id)
        if pip.status not in ['draft', 'submitted']:
            raise ValidationError("Only active PIPs can be completed")
        pip.status = 'completed'
        pip.outcome = outcome
        pip.outcome_notes = notes or ''
        pip.completed_at = timezone.now()
        pip.save()
        if pip.final_rating:
            if outcome == 'successful':
                pip.final_rating.pip_recommended = False
            else:
                pip.final_rating.action_outcome = 'terminate'
            pip.final_rating.save()
        NotificationService.notify_pip_completed(pip)
        return pip