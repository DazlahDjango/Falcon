# apps/reviews/services/pip/pip_tracker.py
"""
Track PIP progress, deadlines, and escalations
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import PIP, PIPAction
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService


class PIPTracker(BaseReviewService):
    """
    Tracks PIP progress, monitors deadlines, and handles escalations
    """
    
    # Escalation settings
    ESCALATION_DAYS = 30  # Days with no progress before escalation
    REMINDER_DAYS = [14, 7, 3]  # Days before deadline to send reminders
    
    @staticmethod
    def get_pip_progress(pip_id):
        """
        Get detailed progress statistics for a PIP.
        
        Args:
            pip_id: PIP ID
        
        Returns:
            dict: Progress statistics
        """
        pip = PIP.objects.get(id=pip_id)
        
        total_actions = pip.actions.count()
        completed_actions = pip.actions.filter(status='completed').count()
        pending_actions = pip.actions.filter(status='pending').count()
        in_progress_actions = pip.actions.filter(status='in_progress').count()
        missed_actions = pip.actions.filter(status='missed').count()
        
        today = timezone.now().date()
        total_days = (pip.end_date - pip.start_date).days
        elapsed_days = (today - pip.start_date).days if today > pip.start_date else 0
        
        return {
            'total_actions': total_actions,
            'completed_actions': completed_actions,
            'pending_actions': pending_actions,
            'in_progress_actions': in_progress_actions,
            'missed_actions': missed_actions,
            'completion_percentage': round((completed_actions / total_actions) * 100, 1) if total_actions > 0 else 0,
            'days_elapsed': elapsed_days,
            'days_remaining': max(0, (pip.end_date - today).days),
            'total_days': total_days,
            'is_on_track': missed_actions == 0 and completed_actions > 0,
            'needs_attention': missed_actions > 0 or pending_actions > 0
        }
    
    @staticmethod
    def check_and_update_action_status(pip_action_id):
        """
        Check if a PIP action is overdue and update status.
        
        Args:
            pip_action_id: PIPAction ID
        
        Returns:
            bool: True if status was updated
        """
        action = PIPAction.objects.get(id=pip_action_id)
        
        if action.status in ['completed', 'waived']:
            return False
        
        today = timezone.now().date()
        
        if action.due_date < today and action.status != 'missed':
            action.status = 'missed'
            action.save()
            
            # Send notification about missed action
            NotificationService.notify_action_missed(action)
            return True
        
        return False
    
    @staticmethod
    def check_escalation_needed(pip_id):
        """
        Check if a PIP needs escalation due to no progress.
        
        Args:
            pip_id: PIP ID
        
        Returns:
            bool: True if escalation is needed
        """
        pip = PIP.objects.get(id=pip_id)
        
        if pip.status != 'active':
            return False
        
        # Check if any actions completed in last ESCALATION_DAYS days
        cutoff_date = timezone.now() - timezone.timedelta(days=PIPTracker.ESCALATION_DAYS)
        
        recent_actions = pip.actions.filter(
            completed_at__gte=cutoff_date
        ).exists()
        
        # Also check if any reviews in last ESCALATION_DAYS days
        recent_reviews = pip.reviews.filter(
            review_date__gte=cutoff_date.date()
        ).exists()
        
        needs_escalation = not recent_actions and not recent_reviews
        
        if needs_escalation:
            pip.severity = 'severe'
            pip.save()
            
            # Send escalation notification
            NotificationService.notify_pip_escalated(pip)
        
        return needs_escalation
    
    @staticmethod
    def get_overdue_actions(pip_id=None):
        """
        Get all overdue PIP actions.
        
        Args:
            pip_id: Optional PIP ID filter
        
        Returns:
            QuerySet of overdue PIPAction objects
        """
        today = timezone.now().date()
        
        queryset = PIPAction.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'in_progress']
        )
        
        if pip_id:
            queryset = queryset.filter(pip_id=pip_id)
        
        return queryset.select_related('pip')
    
    @staticmethod
    def get_pips_needing_review(owner_id=None):
        """
        Get PIPs that need manager review.
        
        Args:
            owner_id: Optional owner (manager) ID filter
        
        Returns:
            QuerySet of PIP objects needing review
        """
        today = timezone.now().date()
        
        # PIPs with missed actions or approaching deadline
        queryset = PIP.objects.filter(
            status='active'
        ).filter(
            # Has missed actions
            actions__status='missed'
        ).distinct()
        
        # Also PIPs with deadline approaching in 7 days
        from datetime import timedelta
        deadline_soon = today + timedelta(days=7)
        
        approaching_deadline = PIP.objects.filter(
            status='active',
            end_date__lte=deadline_soon,
            end_date__gte=today
        )
        
        queryset = queryset | approaching_deadline
        
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
        
        return queryset.distinct()
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def add_progress_review(pip_id, reviewer, employee, data):
        """
        Add a progress review to a PIP.
        
        Args:
            pip_id: PIP ID
            reviewer: User object (manager)
            employee: User object (employee)
            data: Review data with rating, summary, etc.
        
        Returns:
            PIPReview object
        """
        from ...models import PIPReview
        
        pip = PIP.objects.get(id=pip_id)
        
        review = PIPReview.objects.create(
            pip=pip,
            reviewer=reviewer,
            employee=employee,
            review_date=data.get('review_date', timezone.now().date()),
            rating=data.get('rating'),
            summary=data.get('summary'),
            accomplishments=data.get('accomplishments', ''),
            challenges=data.get('challenges', ''),
            action_items=data.get('action_items', ''),
            employee_attended=data.get('employee_attended', True),
            employee_signature=data.get('employee_signature', False)
        )
        
        # Update any actions based on review
        if 'updated_actions' in data:
            for action_data in data['updated_actions']:
                PIPAction.objects.filter(
                    id=action_data['action_id'],
                    pip=pip
                ).update(
                    status=action_data.get('status'),
                    progress_notes=action_data.get('progress_notes', '')
                )
        
        # Check if PIP can be closed
        all_actions_complete = pip.actions.exclude(
            status='completed'
        ).count() == 0
        
        if all_actions_complete and pip.end_date <= timezone.now().date():
            pip.status = 'completed'
            pip.outcome = 'successful'
            pip.completed_at = timezone.now()
            pip.save()
        
        return review