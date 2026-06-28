from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import PIP, PIPAction
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService

class PIPTracker(BaseReviewService):
    @staticmethod
    def get_pip_progress(pip_id):
        pip = PIP.objects.get(id=pip_id)
        total_actions = pip.actions.count()
        completed_actions = pip.actions.filter(status='completed').count()
        pending_actions = pip.actions.filter(status='pending').count()
        in_progress_actions = pip.actions.filter(status='in_progress').count()
        missed_actions = pip.actions.filter(status='missed').count()
        today = timezone.now().date()
        total_days = (pip.end_date - pip.start_date).days
        elapsed_days = (today - pip.start_date).days if today > pip.start_date else 0
        return {'total_actions': total_actions, 'completed_actions': completed_actions, 'pending_actions': pending_actions, 'in_progress_actions': in_progress_actions, 'missed_actions': missed_actions, 'completion_percentage': round((completed_actions / total_actions) * 100, 1) if total_actions > 0 else 0, 'days_elapsed': elapsed_days, 'days_remaining': max(0, (pip.end_date - today).days), 'total_days': total_days, 'is_on_track': missed_actions == 0 and completed_actions > 0, 'needs_attention': missed_actions > 0 or pending_actions > 0}
    @staticmethod
    def check_and_update_action_status(pip_action_id):
        action = PIPAction.objects.get(id=pip_action_id)
        if action.status in ['completed', 'waived']:
            return False
        if action.due_date < timezone.now().date() and action.status != 'missed':
            action.status = 'missed'
            action.save()
            NotificationService.notify_action_missed(action)
            return True
        return False
    @staticmethod
    def check_escalation_needed(pip_id):
        pip = PIP.objects.get(id=pip_id)
        if pip.status not in ['draft', 'submitted']:
            return False
        cutoff_date = timezone.now() - timezone.timedelta(days=30)
        recent_actions = pip.actions.filter(completed_at__gte=cutoff_date).exists()
        recent_reviews = pip.reviews.filter(review_date__gte=cutoff_date.date()).exists()
        needs_escalation = not recent_actions and not recent_reviews
        if needs_escalation:
            pip.severity = 'severe'
            pip.save()
            NotificationService.notify_pip_escalated(pip)
        return needs_escalation
    @staticmethod
    def get_overdue_actions(pip_id=None):
        today = timezone.now().date()
        queryset = PIPAction.objects.filter(due_date__lt=today, status__in=['pending', 'in_progress'])
        if pip_id:
            queryset = queryset.filter(pip_id=pip_id)
        return queryset.select_related('pip')
    @staticmethod
    def get_pips_needing_review(owner_id=None):
        today = timezone.now().date()
        from datetime import timedelta
        deadline_soon = today + timedelta(days=7)
        queryset = PIP.objects.filter(status__in=['draft', 'submitted']).filter(actions__status='missed').distinct()
        approaching_deadline = PIP.objects.filter(status__in=['draft', 'submitted'], end_date__lte=deadline_soon, end_date__gte=today)
        queryset = queryset | approaching_deadline
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        return queryset.distinct()
    @staticmethod
    @BaseReviewService.atomic_operation
    def add_progress_review(pip_id, reviewer, employee, data):
        from ...models import PIPReview
        pip = PIP.objects.get(id=pip_id)
        review = PIPReview.objects.create(pip=pip, reviewer=reviewer, employee=employee, review_date=data.get('review_date', timezone.now().date()), rating=data.get('rating'), summary=data.get('summary'), accomplishments=data.get('accomplishments', ''), challenges=data.get('challenges', ''), action_items=data.get('action_items', ''), employee_attended=data.get('employee_attended', True), employee_signature=data.get('employee_signature', False))
        if 'updated_actions' in data:
            for action_data in data['updated_actions']:
                PIPAction.objects.filter(id=action_data['action_id'], pip=pip).update(status=action_data.get('status'), progress_notes=action_data.get('progress_notes', ''))
        all_actions_complete = pip.actions.exclude(status='completed').count() == 0
        if all_actions_complete and pip.end_date <= timezone.now().date():
            pip.status = 'completed'
            pip.outcome = 'successful'
            pip.completed_at = timezone.now()
            pip.save()
        return review