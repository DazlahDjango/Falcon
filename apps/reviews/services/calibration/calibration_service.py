from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import CalibrationSession, CalibrationRating, FinalRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService

class CalibrationService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_session(review_cycle, name, facilitator, participants, data):
        session = CalibrationSession.objects.create(tenant_id=review_cycle.tenant_id, review_cycle=review_cycle, name=name, description=data.get('description', ''), session_type=data.get('session_type', 'final'), scheduled_date=data.get('scheduled_date'), facilitator=facilitator, agenda=data.get('agenda', ''), status='draft')
        session.participants.add(*participants)
        if 'departments_included' in data:
            session.departments_included.add(*data['departments_included'])
        for participant in participants:
            NotificationService.notify_calibration_invited(session, participant)
        return session
    @staticmethod
    def get_session(session_id):
        try:
            return CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            return None
    @staticmethod
    def get_sessions_for_cycle(review_cycle_id):
        return CalibrationSession.objects.filter(review_cycle_id=review_cycle_id).order_by('-scheduled_date')
    @staticmethod
    def get_sessions_for_manager(manager, review_cycle=None):
        queryset = CalibrationSession.objects.filter(participants=manager)
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        return queryset.order_by('-scheduled_date')
    @staticmethod
    @BaseReviewService.atomic_operation
    def start_session(session_id):
        session = CalibrationSession.objects.get(id=session_id)
        if session.status != 'draft':
            raise ValidationError("Session cannot be started")
        session.actual_start_time = timezone.now()
        session.status = 'under_review'
        session.save()
        return session
    @staticmethod
    @BaseReviewService.atomic_operation
    def complete_session(session_id, decisions=None):
        session = CalibrationSession.objects.get(id=session_id)
        if session.status != 'under_review':
            raise ValidationError("Only in-progress sessions can be completed")
        session.actual_end_time = timezone.now()
        session.outcome = 'completed'
        session.status = 'completed'
        if decisions:
            session.decisions = decisions
        session.save()
        for participant in session.participants.all():
            NotificationService.notify_calibration_completed(session, participant)
        return session
    @staticmethod
    @BaseReviewService.atomic_operation
    def add_rating_adjustment(session_id, final_rating_id, adjusted_by, before_score, after_score, reason):
        session = CalibrationSession.objects.get(id=session_id)
        final_rating = FinalRating.objects.get(id=final_rating_id)
        if session.status != 'under_review':
            raise ValidationError("Calibration session must be in progress")
        adjustment_amount = after_score - before_score
        calibration_rating = CalibrationRating.objects.create(calibration_session=session, final_rating=final_rating, adjusted_by=adjusted_by, before_score=before_score, before_rating_label='', after_score=after_score, after_rating_label='', adjustment_reason=reason)
        calibration_rating.agreed_by.add(adjusted_by)
        final_rating.final_score = after_score
        final_rating.calibration_adjustment = adjustment_amount
        final_rating.calibration_adjustment_reason = reason
        final_rating.status = 'calibrated'
        final_rating.save()
        return calibration_rating