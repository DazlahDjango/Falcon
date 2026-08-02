from celery import shared_task
from django.utils import timezone
from .models import ReviewCycle, PIP, PIPAction, SelfAssessment, CompetencyRating, FinalRating, FeedbackRequest, CalibrationSession
from .services.tasks.retry import reviews_shared_task
from .services.cycle.cycle_service import CycleService
from .services.pip.pip_generator import PIPGenerator
from .services.pip.pip_tracker import PIPTracker
from .services.feedback.summary_service import SummaryService
from .services.notification.notification_service import NotificationService
from .services.sync import ReviewsDependencySyncService, ReviewsResourceSyncService
from .services.security import IntegrityService
from .services.settings import ReviewsSettingsService

def get_today():
    return timezone.now().date()

def get_remaining_days(target_date):
    if not target_date:
        return None
    delta = target_date - get_today()
    return delta.days

@shared_task
def check_cycle_deadlines():
    today = get_today()
    cycles = ReviewCycle.objects.filter(status='submitted', end_date__gte=today)
    for cycle in cycles:
        days_until_self_assessment = get_remaining_days(cycle.self_assessment_deadline)
        days_until_supervisor_review = get_remaining_days(cycle.supervisor_review_deadline)
        if days_until_self_assessment == 7:
            _send_self_assessment_reminders.delay(cycle.id)
        if days_until_supervisor_review == 7:
            _send_supervisor_review_reminders.delay(cycle.id)
    return {'cycles_checked': cycles.count()}

@shared_task
def close_expired_cycles():
    today = get_today()
    expired_cycles = ReviewCycle.objects.filter(status='submitted', end_date__lt=today)
    count = 0
    for cycle in expired_cycles:
        CycleService.process_cycle_completion(cycle)
        cycle.status = 'completed'
        cycle.save()
        count += 1
    return {'closed_cycles': count}

@shared_task
def batch_create_self_assessments(cycle_id):
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        return {'created': CycleService.create_self_assessments_for_cycle(cycle)}
    except ReviewCycle.DoesNotExist:
        return {'error': 'Cycle not found'}

@shared_task
def batch_generate_final_ratings(cycle_id):
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        return {'generated': CycleService.process_cycle_completion(cycle)}
    except ReviewCycle.DoesNotExist:
        return {'error': 'Cycle not found'}

@shared_task
def check_pip_deadlines():
    today = get_today()
    active_pips = PIP.objects.filter(status__in=['draft', 'submitted'])
    for pip in active_pips:
        days_remaining = get_remaining_days(pip.end_date)
        if days_remaining in [14, 7, 3]:
            NotificationService.notify_pip_reminder(pip, days_remaining)
    return {'pips_checked': active_pips.count()}

@shared_task
def check_pip_action_deadlines():
    today = get_today()
    overdue_actions = PIPAction.objects.filter(status__in=['pending', 'in_progress'], due_date__lt=today)
    for action in overdue_actions:
        PIPTracker.check_and_update_action_status(action.id)
        NotificationService.notify_action_missed(action)
    return {'overdue_actions': overdue_actions.count()}

@shared_task
def auto_escalate_pip(pip_id):
    try:
        pip = PIP.objects.get(id=pip_id, status__in=['draft', 'submitted'])
        return {'escalated': PIPTracker.check_escalation_needed(pip.id)}
    except PIP.DoesNotExist:
        return {'error': 'PIP not found'}

@shared_task
def generate_pip_from_low_rating(final_rating_id):
    try:
        final_rating = FinalRating.objects.get(id=final_rating_id)
        pip = PIPGenerator.generate_pip_from_rating(final_rating_id)
        return {'created': pip.id if pip else None}
    except Exception as e:
        return {'error': str(e)}

@shared_task
def batch_generate_feedback_summaries(cycle_id):
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        subjects = FeedbackRequest.objects.filter(review_cycle=cycle, status='submitted').values_list('subject_id', flat=True).distinct()
        count = 0
        for subject_id in subjects:
            SummaryService.generate_summary(cycle_id, subject_id)
            count += 1
        return {'summaries_generated': count}
    except ReviewCycle.DoesNotExist:
        return {'error': 'Cycle not found'}

@shared_task
def send_feedback_reminders():
    today = get_today()
    pending_requests = FeedbackRequest.objects.filter(status='draft', due_date__lte=today + timezone.timedelta(days=3), due_date__gte=today, reminder_sent_at__isnull=True)
    for request in pending_requests:
        NotificationService.notify_feedback_reminder(request)
        request.reminder_sent_at = timezone.now()
        request.save()
    return {'reminders_sent': pending_requests.count()}

@shared_task
def send_calibration_reminders():
    today = get_today()
    three_days_from_now = today + timezone.timedelta(days=3)
    upcoming_sessions = CalibrationSession.objects.filter(scheduled_date__date__lte=three_days_from_now, scheduled_date__date__gte=today, status='draft')
    for session in upcoming_sessions:
        for participant in session.participants.all():
            NotificationService.notify_calibration_invited(session, participant)
    return {'reminders_sent': upcoming_sessions.count()}

@shared_task
def _send_self_assessment_reminders(cycle_id):
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        pending_assessments = SelfAssessment.objects.filter(review_cycle=cycle, status='draft').select_related('employee')
        for assessment in pending_assessments:
            NotificationService.notify_self_assessment_reminder(assessment)
        return {'reminders_sent': pending_assessments.count()}
    except ReviewCycle.DoesNotExist:
        return {'error': 'Cycle not found'}

@shared_task
def _send_supervisor_review_reminders(cycle_id):
    try:
        cycle = ReviewCycle.objects.get(id=cycle_id)
        pending_reviews = cycle.supervisor_reviews.filter(status='draft').select_related('supervisor')
        for review in pending_reviews:
            NotificationService.notify_supervisor_review_reminder(review)
        return {'reminders_sent': pending_reviews.count()}
    except ReviewCycle.DoesNotExist:
        return {'error': 'Cycle not found'}

@shared_task
def cleanup_old_comments(days=90):
    cutoff_date = timezone.now() - timezone.timedelta(days=days)
    from .models import ReviewComment
    old_comments = ReviewComment.objects.filter(created_at__lt=cutoff_date, is_deleted=False)
    count = old_comments.count()
    old_comments.update(is_deleted=True, deleted_at=timezone.now())
    return {'deleted': count}

@shared_task
def reviews_health_check():
    active_cycles = ReviewCycle.objects.filter(status='submitted').count()
    pending_sa = SelfAssessment.objects.filter(status='draft').count()
    pending_sr = SupervisorReview.objects.filter(status='draft').count()
    return {'status': 'healthy', 'active_cycles': active_cycles, 'pending_self_assessments': pending_sa, 'pending_supervisor_reviews': pending_sr, 'timestamp': timezone.now().isoformat()}

@reviews_shared_task
def cleanup_orphaned_ratings(self):
    deleted = 0
    for rating in CompetencyRating.objects.filter(deleted_at__isnull=True).iterator(chunk_size=200):
        model = rating.content_type.model_class()
        if model is None or not model.objects.filter(pk=rating.object_id).exists():
            rating.delete()
            deleted += 1
    return {'deleted': deleted}

@reviews_shared_task
def delete_old_draft_assessments(self):
    days = ReviewsSettingsService.get_section('stability').get('draft_assessment_retention_days', 90)
    cutoff = timezone.now() - timezone.timedelta(days=days)
    qs = SelfAssessment.objects.filter(status='draft', created_at__lt=cutoff)
    count = qs.count()
    qs.delete()
    return {'deleted': count}

@reviews_shared_task
def detect_stalled_pips(self):
    days = ReviewsSettingsService.get_section('stability').get('pip_escalation_days', 30)
    PIPTracker.ESCALATION_DAYS = days
    escalated = 0
    for pip in PIP.objects.filter(status__in=['draft', 'submitted']).iterator(chunk_size=100):
        if PIPTracker.check_escalation_needed(pip.id):
            escalated += 1
    return {'escalated': escalated}

@reviews_shared_task
def warm_dashboard_cache(self):
    from apps.tenant.models import Organization
    warmed = 0
    for client in Organization.objects.filter(is_deleted=False):
        ReviewsResourceSyncService.build_dashboard_metrics(client.id, broadcast=True)
        warmed += 1
    return {'tenants': warmed}

@reviews_shared_task
def sync_kpi_data(self):
    from apps.tenant.models import Organization
    for client in Organization.objects.filter(is_deleted=False)[:50]:
        ReviewsDependencySyncService.on_kpi_score_changed(client.id, recalculate_final_ratings=False)
    return {'status': 'ok'}

@shared_task
def sync_mission_data():
    return {'status': 'skipped', 'reason': 'mission_app_not_configured'}

@shared_task
def sync_task_data():
    return {'status': 'skipped', 'reason': 'task_app_not_configured'}

@reviews_shared_task
def clear_stale_cache(self):
    ReviewsSettingsService.invalidate_cache()
    return {'cleared': True}

@reviews_shared_task
def validate_data_integrity(self):
    from .models import ReviewComment, FeedbackResponse, SelfAssessment
    failures = []
    for model, fields in [(ReviewComment, ['comment']), (FeedbackResponse, ['strengths', 'areas_for_improvement', 'additional_comments']), (SelfAssessment, ['overall_comment', 'strengths', 'areas_for_improvement'])]:
        for obj in model.objects.all()[:500]:
            if not IntegrityService.verify(obj, fields):
                failures.append(f'{model.__name__}:{obj.id}')
    return {'failures': failures, 'count': len(failures)}

@shared_task
def archive_completed_cycles():
    cutoff = timezone.now().date() - timezone.timedelta(days=365)
    updated = ReviewCycle.objects.filter(status='completed', end_date__lt=cutoff).update(status='archived')
    return {'archived': updated}

@shared_task
def escalate_unanswered_feedback():
    return {'escalated': 0}

@shared_task
def calibration_followup():
    return {'status': 'ok'}

@shared_task
def send_self_assessment_reminders():
    today = get_today()
    cycles = ReviewCycle.objects.filter(status='submitted', self_assessment_deadline__lte=today + timezone.timedelta(days=7), self_assessment_deadline__gte=today)
    count = 0
    for cycle in cycles:
        result = _send_self_assessment_reminders.delay(cycle.id)
        count += 1
    return {'sent': count}

@shared_task
def send_supervisor_review_reminders():
    today = get_today()
    cycles = ReviewCycle.objects.filter(status='submitted', supervisor_review_deadline__lte=today + timezone.timedelta(days=7), supervisor_review_deadline__gte=today)
    count = 0
    for cycle in cycles:
        result = _send_supervisor_review_reminders.delay(cycle.id)
        count += 1
    return {'sent': count}

@shared_task
def check_missing_reviews():
    from .models import SupervisorReview
    missing = SupervisorReview.objects.filter(status='draft', review_cycle__self_assessment_deadline__lt=get_today())
    return {'missing': missing.count()}

@shared_task
def generate_monthly_report():
    from apps.tenant.models import Organization
    from apps.reviews.services.reporting.organization_report_service import OrganizationReportService
    results = {}
    for org in Organization.objects.filter(is_deleted=False):
        cycle = ReviewCycle.objects.filter(tenant_id=org.id, status='completed').order_by('-end_date').first()
        if cycle:
            summary = OrganizationReportService.get_organization_summary(cycle.id, org.id)
            results[str(org.id)] = {
                'cycle_name': cycle.name,
                'summary': summary
            }
        else:
            results[str(org.id)] = {'status': 'no_completed_cycles'}
    return {'status': 'completed', 'results': results}

@shared_task
def generate_quarterly_report(quarter=1):
    from apps.tenant.models import Organization
    from apps.reviews.services.reporting.organization_report_service import OrganizationReportService
    results = {}
    for org in Organization.objects.filter(is_deleted=False):
        cycles = ReviewCycle.objects.filter(tenant_id=org.id, status='completed').order_by('-end_date')[:3]
        if cycles.exists():
            summaries = []
            for cycle in cycles:
                summary = OrganizationReportService.get_organization_summary(cycle.id, org.id)
                summaries.append({
                    'cycle_name': cycle.name,
                    'summary': summary
                })
            results[str(org.id)] = summaries
        else:
            results[str(org.id)] = {'status': 'no_completed_cycles'}
    return {'status': 'completed', 'results': results, 'quarter': quarter}

@shared_task
def calculate_rating_distribution():
    return {'status': 'ok'}

@shared_task
def detect_rating_inflation():
    from .models import FinalRating
    from django.db.models import Avg
    high_ratings = FinalRating.objects.filter(final_score__gt=90).count()
    return {'high_ratings_count': high_ratings}

@shared_task
def calculate_manager_consistency():
    return {'status': 'ok'}

@shared_task(name='apps.reviews.tasks.health_check')
def health_check():
    return reviews_health_check()