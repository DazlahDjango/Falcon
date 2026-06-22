from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import ReviewCycle, SelfAssessment, SupervisorReview, FinalRating, PIP, PIPAction, FeedbackRequest, FeedbackResponse, CalibrationRating, CalibrationSession, PromotionRecommendation
from .services.cycle.cycle_service import CycleService
from .services.assessment.final_rating_service import FinalRatingService
from .services.pip.pip_generator import PIPGenerator
from .services.pip.pip_tracker import PIPTracker
from .services.promotion.promotion_service import PromotionService
from .services.feedback.summary_service import SummaryService
from .services.notification.notification_service import NotificationService

@receiver(pre_save, sender=ReviewCycle)
def review_cycle_pre_save(sender, instance, **kwargs):
    today = timezone.now().date()
    if instance.start_date <= today <= instance.end_date:
        if instance.status not in ['submitted', 'approved']:
            instance.status = 'submitted'
    elif today < instance.start_date:
        if instance.status != 'draft':
            instance.status = 'draft'
    elif today > instance.end_date:
        if instance.status not in ['completed', 'approved', 'archived']:
            instance.status = 'completed'

@receiver(post_save, sender=ReviewCycle)
def review_cycle_post_save(sender, created, instance, **kwargs):
    if instance.status == 'submitted':
        CycleService.create_self_assessments_for_cycle(instance)
        from apps.accounts.models import User
        employees = User.objects.filter(tenant_id=instance.tenant_id, is_active=True)
        NotificationService.notify_cycle_started(instance, employees)
    if instance.status == 'completed':
        CycleService.process_cycle_completion(instance)

@receiver(pre_save, sender=SelfAssessment)
def self_assessment_pre_save(sender, instance, **kwargs):
    if instance.status == 'submitted' and instance.submitted_at is None:
        instance.submitted_at = timezone.now()

@receiver(post_save, sender=SelfAssessment)
def self_assessment_post_save(sender, created, instance, **kwargs):
    if instance.status == 'submitted':
        NotificationService.notify_supervisor_review_ready(instance)

@receiver(pre_save, sender=SupervisorReview)
def supervisor_review_pre_save(sender, instance, **kwargs):
    if instance.status == 'submitted' and instance.submitted_at is None:
        instance.submitted_at = timezone.now()
    if instance.status == 'approved' and instance.reviewed_at is None:
        instance.reviewed_at = timezone.now()

@receiver(post_save, sender=SupervisorReview)
def supervisor_review_post_save(sender, created, instance, **kwargs):
    if instance.status == 'approved':
        FinalRatingService.create_or_update_from_review(instance.id)
        NotificationService.notify_review_approved(instance)

@receiver(pre_save, sender=FinalRating)
def final_rating_pre_save(sender, instance, **kwargs):
    if instance.final_score is not None and instance.rating_scale:
        rating_level = instance.rating_scale.get_level_by_percentage(float(instance.final_score))
        if rating_level:
            instance.final_rating_label = rating_level.get('label', '')
            instance.final_rating_color = rating_level.get('color', 'gray')
    if instance.status == 'approved' and instance.approved_at is None:
        instance.approved_at = timezone.now()

@receiver(post_save, sender=FinalRating)
def final_rating_post_save(sender, created, instance, **kwargs):
    if instance.status == 'locked':
        if instance.final_score and instance.final_score < 60:
            PIPGenerator.generate_pip_from_rating(instance.id)
        if instance.promotion_recommended:
            PromotionService.create_from_final_rating(instance.id)
        NotificationService.notify_final_rating_complete(instance)

@receiver(pre_save, sender=PIP)
def pip_pre_save(sender, instance, **kwargs):
    if instance.status == 'completed' and instance.completed_at is None:
        instance.completed_at = timezone.now()

@receiver(post_save, sender=PIP)
def pip_post_save(sender, created, instance, **kwargs):
    if created:
        NotificationService.notify_pip_created(instance)
    if instance.status == 'completed' and instance.outcome:
        if instance.final_rating:
            if instance.outcome == 'successful':
                instance.final_rating.pip_recommended = False
            else:
                instance.final_rating.action_outcome = 'terminate'
            instance.final_rating.save()

@receiver(pre_save, sender=PIPAction)
def pip_action_pre_save(sender, instance, **kwargs):
    if instance.status == 'completed' and instance.completed_at is None:
        instance.completed_at = timezone.now()

@receiver(post_save, sender=PIPAction)
def pip_action_post_save(sender, created, instance, **kwargs):
    if instance.status == 'completed':
        pip = instance.pip
        all_actions = pip.actions.all()
        completed_actions = all_actions.filter(status='completed')
        if all_actions.count() == completed_actions.count() and all_actions.count() > 0:
            pip.status = 'completed'
            pip.outcome = 'successful'
            pip.completed_at = timezone.now()
            pip.save()

@receiver(post_save, sender=FeedbackRequest)
def feedback_request_post_save(sender, created, instance, **kwargs):
    if created:
        NotificationService.notify_feedback_requested(instance)

@receiver(post_save, sender=FeedbackResponse)
def feedback_response_post_save(sender, created, instance, **kwargs):
    if created:
        request = instance.feedback_request
        request.status = 'submitted'
        request.completed_at = timezone.now()
        request.save()
        pending = FeedbackRequest.objects.filter(review_cycle=request.review_cycle, subject=request.subject, is_required=True, status='draft').count()
        if pending == 0:
            SummaryService.generate_summary(request.review_cycle.id, request.subject.id)

@receiver(post_save, sender=CalibrationRating)
def calibration_rating_post_save(sender, created, instance, **kwargs):
    final_rating = instance.final_rating
    final_rating.final_score = instance.after_score
    final_rating.calibration_adjustment = instance.after_score - instance.before_score
    final_rating.calibration_adjustment_reason = instance.adjustment_reason
    final_rating.status = 'calibrated'
    final_rating.save()

@receiver(post_save, sender=CalibrationSession)
def calibration_session_post_save(sender, created, instance, **kwargs):
    if instance.outcome == 'completed':
        for rating in instance.rating_adjustments.all():
            rating.final_rating.status = 'calibrated'
            rating.final_rating.save()

@receiver(pre_save, sender=PromotionRecommendation)
def promotion_pre_save(sender, instance, **kwargs):
    if instance.status == 'approved' and instance.approved_at is None:
        instance.approved_at = timezone.now()

@receiver(post_save, sender=PromotionRecommendation)
def promotion_post_save(sender, created, instance, **kwargs):
    if instance.status == 'approved':
        NotificationService.notify_promotion_approved(instance)
    elif instance.status == 'rejected':
        NotificationService.notify_promotion_rejected(instance, instance.rejection_reason)
    if instance.status == 'completed' and instance.actual_promotion_date is None:
        instance.actual_promotion_date = timezone.now().date()
        instance.save()

@receiver(pre_delete, sender=ReviewCycle)
def review_cycle_pre_delete(sender, instance, **kwargs):
    if instance.self_assessments.exists():
        raise ValidationError("Cannot delete cycle with existing self assessments. Archive it instead.")

@receiver(pre_delete, sender=FinalRating)
def final_rating_pre_delete(sender, instance, **kwargs):
    instance.is_deleted = True
    instance.deleted_at = timezone.now()
    instance.save()
    return False