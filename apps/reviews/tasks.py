# apps/reviews/tasks.py
"""
Celery tasks for Reviews app
Background tasks for reminders, escalations, and batch processing
"""

from celery import shared_task
from django.utils import timezone

from .models import ReviewCycle, PIP, PIPAction, SelfAssessment, CompetencyRating
from .services.tasks.retry import reviews_shared_task
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


# ========== Stability & sync tasks (referenced by celery beat) ==========

@reviews_shared_task
def cleanup_orphaned_ratings(self):
    """Remove CompetencyRating rows whose parent object no longer exists."""
    deleted = 0
    for rating in CompetencyRating.objects.filter(deleted_at__isnull=True).iterator(chunk_size=200):
        model = rating.content_type.model_class()
        if model is None or not model.objects.filter(pk=rating.object_id).exists():
            rating.hard_delete() if hasattr(rating, 'hard_delete') else rating.delete()
            deleted += 1
    return {'deleted': deleted}


@reviews_shared_task
def delete_old_draft_assessments(self):
    """Hard-delete draft self assessments older than retention setting."""
    from apps.reviews.services.settings import ReviewsSettingsService
    days = ReviewsSettingsService.get_section('stability').get(
        'draft_assessment_retention_days', 90,
    )
    cutoff = timezone.now() - timezone.timedelta(days=days)
    qs = SelfAssessment.objects.filter(status='draft', created_at__lt=cutoff)
    count = qs.count()
    qs.delete()
    return {'deleted': count}


@reviews_shared_task
def detect_stalled_pips(self):
    """Escalate active PIPs with no progress for pip_escalation_days."""
    from apps.reviews.services.settings import ReviewsSettingsService
    days = ReviewsSettingsService.get_section('stability').get('pip_escalation_days', 30)
    PIPTracker.ESCALATION_DAYS = days
    escalated = 0
    for pip in PIP.objects.filter(status='active').iterator(chunk_size=100):
        if PIPTracker.check_escalation_needed(pip.id):
            escalated += 1
    return {'escalated': escalated}


@reviews_shared_task
def warm_dashboard_cache(self):
    """Pre-warm dashboard metrics for all active tenants."""
    from apps.tenant.models import Client
    from apps.reviews.services.sync import ReviewsResourceSyncService
    warmed = 0
    for tid in Client.objects.filter(is_deleted=False).values_list('id', flat=True):
        ReviewsResourceSyncService.build_dashboard_metrics(tid, broadcast=True)
        warmed += 1
    return {'tenants': warmed}


@reviews_shared_task
def sync_kpi_data(self):
    """Sync KPI aggregates and notify dashboards."""
    from apps.tenant.models import Client
    from apps.reviews.services.sync import ReviewsDependencySyncService
    for tid in Client.objects.filter(is_deleted=False).values_list('id', flat=True)[:50]:
        ReviewsDependencySyncService.on_kpi_score_changed(tid, recalculate_final_ratings=False)
    return {'status': 'ok'}


@shared_task
def sync_mission_data():
    """Placeholder for mission app integration."""
    return {'status': 'skipped', 'reason': 'mission_app_not_configured'}


@shared_task
def sync_task_data():
    """Placeholder for task app integration."""
    return {'status': 'skipped', 'reason': 'task_app_not_configured'}


@reviews_shared_task
def clear_stale_cache(self):
    from apps.reviews.services.settings import ReviewsSettingsService
    ReviewsSettingsService.invalidate_cache()
    return {'cleared': True}


@reviews_shared_task
def validate_data_integrity(self):
    """Verify checksums on encrypted models."""
    from apps.reviews.services.security import IntegrityService
    from apps.reviews.models import ReviewComment, FeedbackResponse, SelfAssessment
    failures = []
    for model, fields in [
        (ReviewComment, ['comment']),
        (FeedbackResponse, ['strengths', 'areas_for_improvement', 'additional_comments']),
        (SelfAssessment, ['overall_comment']),
    ]:
        for obj in model.objects.all()[:500]:
            if not IntegrityService.verify(obj, fields):
                failures.append(f'{model.__name__}:{obj.id}')
    return {'failures': failures, 'count': len(failures)}


@shared_task
def archive_completed_cycles():
    from .models import ReviewCycle
    cutoff = timezone.now().date() - timezone.timedelta(days=365)
    updated = ReviewCycle.objects.filter(
        status='completed', end_date__lt=cutoff,
    ).update(status='archived')
    return {'archived': updated}


@shared_task
def escalate_unanswered_feedback():
    return {'escalated': 0}


@shared_task
def calibration_followup():
    return {'status': 'ok'}


@shared_task
def send_self_assessment_reminders():
    return {'sent': 0}


@shared_task
def send_supervisor_review_reminders():
    return {'sent': 0}


@shared_task
def check_missing_reviews():
    return {'missing': 0}


@shared_task
def generate_monthly_report():
    return {'status': 'not_implemented'}


@shared_task
def generate_quarterly_report(quarter=1):
    return {'status': 'not_implemented', 'quarter': quarter}


@shared_task
def calculate_rating_distribution():
    return {'status': 'ok'}


@shared_task
def detect_rating_inflation():
    return {'status': 'ok'}


@shared_task
def calculate_manager_consistency():
    return {'status': 'ok'}


@shared_task(name='apps.reviews.tasks.health_check')
def health_check():
    return reviews_health_check()