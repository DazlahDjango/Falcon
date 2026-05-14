# apps/reviews/services/calibration/calibration_service.py
"""
Calibration session business logic
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import CalibrationSession, CalibrationRating, FinalRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService


class CalibrationService(BaseReviewService):
    """
    Handles business logic for calibration sessions
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_session(review_cycle, name, facilitator, participants, data):
        """
        Create a new calibration session.
        
        Args:
            review_cycle: ReviewCycle object
            name: Session name
            facilitator: User object (HR person running session)
            participants: List of manager User objects
            data: Dictionary with session data
        
        Returns:
            CalibrationSession object
        """
        session = CalibrationSession.objects.create(
            tenant=review_cycle.tenant,
            review_cycle=review_cycle,
            name=name,
            description=data.get('description', ''),
            session_type=data.get('session_type', 'final'),
            scheduled_date=data.get('scheduled_date'),
            facilitator=facilitator,
            agenda=data.get('agenda', ''),
            status='active'
        )
        
        # Add participants
        session.participants.add(*participants)
        
        # Add departments if specified
        if 'departments_included' in data:
            session.departments_included.add(*data['departments_included'])
        
        # Notify participants
        for participant in participants:
            NotificationService.notify_calibration_invited(session, participant)
        
        return session
    
    @staticmethod
    def get_session(session_id):
        """Get a single calibration session by ID"""
        try:
            return CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            return None
    
    @staticmethod
    def get_sessions_for_cycle(review_cycle_id):
        """Get all calibration sessions for a review cycle"""
        return CalibrationSession.objects.filter(
            review_cycle_id=review_cycle_id
        ).order_by('-scheduled_date')
    
    @staticmethod
    def get_sessions_for_manager(manager, review_cycle=None):
        """
        Get calibration sessions a manager is participating in.
        
        Args:
            manager: User object
            review_cycle: Optional cycle filter
        
        Returns:
            QuerySet of CalibrationSession objects
        """
        queryset = CalibrationSession.objects.filter(participants=manager)
        
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        
        return queryset.order_by('-scheduled_date')
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def start_session(session_id):
        """Mark a calibration session as started."""
        session = CalibrationSession.objects.get(id=session_id)
        
        if session.status != 'active':
            raise ValidationError("Session cannot be started")
        
        session.actual_start_time = timezone.now()
        session.status = 'in_progress'
        session.save()
        
        return session
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def complete_session(session_id, decisions=None):
        """
        Complete a calibration session.
        
        Args:
            session_id: Session ID
            decisions: Optional decisions summary
        
        Returns:
            CalibrationSession object
        """
        session = CalibrationSession.objects.get(id=session_id)
        
        if session.status != 'in_progress':
            raise ValidationError("Only in-progress sessions can be completed")
        
        session.actual_end_time = timezone.now()
        session.outcome = 'completed'
        session.status = 'completed'
        
        if decisions:
            session.decisions = decisions
        
        session.save()
        
        # Send notifications to participants
        for participant in session.participants.all():
            NotificationService.notify_calibration_completed(session, participant)
        
        return session
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def add_rating_adjustment(session_id, final_rating_id, adjusted_by, before_score, after_score, reason):
        """
        Add a rating adjustment during calibration.
        
        Args:
            session_id: Calibration session ID
            final_rating_id: Final rating being adjusted
            adjusted_by: User making adjustment
            before_score: Original score
            after_score: Calibrated score
            reason: Reason for adjustment
        
        Returns:
            CalibrationRating object
        """
        session = CalibrationSession.objects.get(id=session_id)
        final_rating = FinalRating.objects.get(id=final_rating_id)
        
        if session.status != 'in_progress':
            raise ValidationError("Calibration session must be in progress")
        
        # Create calibration rating record
        calibration_rating = CalibrationRating.objects.create(
            calibration_session=session,
            final_rating=final_rating,
            adjusted_by=adjusted_by,
            before_score=before_score,
            after_score=after_score,
            adjustment_reason=reason
        )
        
        # Update the final rating
        final_rating.final_score = after_score
        final_rating.calibration_adjustment = after_score - before_score
        final_rating.calibration_adjustment_reason = reason
        final_rating.status = 'calibrated'
        final_rating.save()
        
        return calibration_rating