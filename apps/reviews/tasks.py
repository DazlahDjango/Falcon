# apps/reviews/tasks.py
"""
Celery tasks for Reviews app
Background tasks for reminders, escalations, and batch processing
"""

from celery import shared_task
from django.utils import timezone

from .models import ReviewCycle, PIP, PIPAction
from .utils import get_today, get_remaining_days

# Import services
from .services.cycle.cycle_service import CycleService
from .services.pip.pip_generator import PIPGenerator
from .services.pip.pip_tracker import PIPTracker
from .services.feedback.summary_service import SummaryService
from .services.notification.notification_service import NotificationService


# ========== Cycle Tasks ==========

@shared_task
def check_cycle_deadlines():
    """
    Daily task to check review cycle deadlines.
    Sends reminders for upcoming deadlines.
    """
    today = get_today()
    
    # Active cycles
    cycles = ReviewCycle.objects.filter(
        status='active',
        end_date__gte=today
    )
    
    for cycle in cycles:
        days_until_self_assessment = get_remaining_days(cycle.self_assessment_deadline)
        days_until_supervisor_review = get_remaining_days(cycle.supervisor_review_deadline)
        
        # Send self assessment reminder (7 days before)
        if days_until_self_assessment == 7:
            _send_self_assessment_reminders.delay(cycle.id)
        
        # Send supervisor review reminder (7 days before)
        if days_until_supervisor_review == 7:
            _send_supervisor_review_reminders.delay(cycle.id)


@shared_task
def close_expired_cycles():
    """
    Daily task to close cycles past their end date.
    Uses CycleService.
    """
    today = get_today()
    
    expired_cycles = ReviewCycle.objects.filter(
        status='active',
        end_date__lt=today
    )
    
    for cycle in expired_cycles:
        # Use CycleService to process completion
        CycleService.process_cycle_completion(cycle)
        cycle.status = 'completed'
        cycle.save()


@shared_task
def batch_create_self_assessments(cycle_id):
    """
    Create self assessments for all employees in a cycle.
    Uses CycleService.
    """
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        CycleService.create_self_assessments_for_cycle(cycle)
    except ReviewCycle.DoesNotExist:
        pass


@shared_task
def batch_generate_final_ratings(cycle_id):
    """
    Generate final ratings for all employees in a completed cycle.
    Uses CycleService.
    """
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        CycleService.process_cycle_completion(cycle)
    except ReviewCycle.DoesNotExist:
        pass


# ========== PIP Tasks ==========

@shared_task
def check_pip_deadlines():
    """
    Daily task to check PIP deadlines.
    Sends reminders and escalates overdue PIPs.
    Uses PIPTracker and NotificationService.
    """
    today = get_today()
    
    # Active PIPs
    active_pips = PIP.objects.filter(status='active')
    
    for pip in active_pips:
        days_remaining = get_remaining_days(pip.end_date)
        
        # Send reminders at 14, 7, and 3 days before
        if days_remaining in [14, 7, 3]:
            NotificationService.notify_pip_reminder(pip, days_remaining)
        
        # Check escalation needed (30+ days no progress)
        if PIPTracker.check_escalation_needed(pip.id):
            pass  # Escalation handled in tracker


@shared_task
def check_pip_action_deadlines():
    """
    Daily task to check PIP action deadlines.
    Marks overdue actions and triggers alerts.
    Uses PIPTracker and NotificationService.
    """
    today = get_today()
    
    # Pending actions past due date
    overdue_actions = PIPAction.objects.filter(
        status__in=['pending', 'in_progress'],
        due_date__lt=today
    )
    
    for action in overdue_actions:
        # Use PIPTracker to update status
        PIPTracker.check_and_update_action_status(action.id)
        
        # Notify manager of missed action
        NotificationService.notify_action_missed(action)


@shared_task
def auto_escalate_pip(pip_id):
    """
    Escalate PIP that has shown no progress.
    Uses PIPTracker.
    """
    try:
        pip = PIP.objects.get(id=pip_id, status='active')
        PIPTracker.check_escalation_needed(pip.id)
    except PIP.DoesNotExist:
        pass


@shared_task
def generate_pip_from_low_rating(final_rating_id):
    """
    Generate a PIP from a low final rating.
    Uses PIPGenerator.
    """
    try:
        PIPGenerator.generate_pip_from_rating(final_rating_id)
    except Exception as e:
        print(f"Failed to generate PIP from rating {final_rating_id}: {e}")


# ========== Feedback Tasks ==========

@shared_task
def batch_generate_feedback_summaries(cycle_id):
    """
    Generate feedback summaries for all employees in a cycle.
    Uses SummaryService.
    """
    from .models import FeedbackRequest
    
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        # Get all subjects with completed feedback
        subjects = FeedbackRequest.objects.filter(
            review_cycle=cycle,
            status='completed'
        ).values_list('subject_id', flat=True).distinct()
        
        for subject_id in subjects:
            SummaryService.generate_summary(cycle_id, subject_id)
    except ReviewCycle.DoesNotExist:
        pass


@shared_task
def send_feedback_reminders():
    """
    Daily task to send reminders for pending feedback requests.
    Uses NotificationService.
    """
    from .models import FeedbackRequest
    
    today = get_today()
    
    # Pending requests with due date approaching (3 days before)
    pending_requests = FeedbackRequest.objects.filter(
        status='pending',
        due_date__lte=today + timezone.timedelta(days=3),
        due_date__gte=today,
        reminder_sent_at__isnull=True
    )
    
    for request in pending_requests:
        NotificationService.notify_feedback_reminder(request)
        request.reminder_sent_at = timezone.now()
        request.save()


# ========== Calibration Tasks ==========

@shared_task
def send_calibration_reminders():
    """
    Daily task to send reminders for upcoming calibration sessions.
    Uses NotificationService.
    """
    from .models import CalibrationSession
    
    today = get_today()
    three_days_from_now = today + timezone.timedelta(days=3)
    
    # Sessions in next 3 days that haven't had reminders sent
    upcoming_sessions = CalibrationSession.objects.filter(
        scheduled_date__date__lte=three_days_from_now,
        scheduled_date__date__gte=today,
        status='active'
    )
    
    for session in upcoming_sessions:
        for participant in session.participants.all():
            NotificationService.notify_calibration_invited(session, participant)


# ========== Internal Helper Tasks ==========

@shared_task
def _send_self_assessment_reminders(cycle_id):
    """
    Send self assessment reminders to all employees in a cycle.
    Uses NotificationService.
    """
    from .models import ReviewCycle, SelfAssessment
    
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        # Get employees who haven't submitted
        pending_assessments = SelfAssessment.objects.filter(
            review_cycle=cycle,
            status='draft'
        ).select_related('employee')
        
        for assessment in pending_assessments:
            NotificationService.notify_self_assessment_reminder(assessment)
    except ReviewCycle.DoesNotExist:
        pass


@shared_task
def _send_supervisor_review_reminders(cycle_id):
    """
    Send supervisor review reminders to all managers in a cycle.
    Uses NotificationService.
    """
    from .models import ReviewCycle, SupervisorReview
    
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        
        # Get reviews not yet submitted
        pending_reviews = SupervisorReview.objects.filter(
            review_cycle=cycle,
            status='draft'
        ).select_related('supervisor')
        
        for review in pending_reviews:
            NotificationService.notify_supervisor_review_reminder(review)
    except ReviewCycle.DoesNotExist:
        pass


@shared_task
def cleanup_old_notifications(days=90):
    """
    Weekly task to clean up old notification records.
    """
    from .models import ReviewComment
    
    cutoff_date = timezone.now() - timezone.timedelta(days=days)
    
    # Soft delete old comments
    old_comments = ReviewComment.objects.filter(
        created_at__lt=cutoff_date,
        is_deleted=False
    )
    
    count = old_comments.count()
    old_comments.update(is_deleted=True, deleted_at=timezone.now())
    
    return f"Cleaned up {count} old comments"


# ========== Health Check Tasks ==========

@shared_task
def reviews_health_check():
    """
    Health check task for monitoring.
    """
    from .models import ReviewCycle
    
    active_cycles = ReviewCycle.objects.filter(status='active').count()
    
    return {
        'status': 'healthy',
        'active_cycles': active_cycles,
        'timestamp': timezone.now().isoformat()
    }