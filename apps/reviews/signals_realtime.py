from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.reviews.models import (
    SelfAssessment,
    SupervisorReview,
    FinalRating,
    FeedbackResponse,
)
from apps.reviews.services.realtime import ReviewsEventBroadcaster
from apps.reviews.services.sync import ReviewsDependencySyncService

@receiver(post_save, sender=SelfAssessment)
def broadcast_self_assessment(sender, instance, created, **kwargs):
    if instance.status == 'submitted':
        name = getattr(instance.employee, 'get_full_name', lambda: '')() or str(instance.employee_id)
        ReviewsEventBroadcaster.review_submitted(
            cycle_id=str(instance.review_cycle_id),
            employee_id=str(instance.employee_id),
            employee_name=name,
            review_type='self_assessment',
        )

@receiver(post_save, sender=SupervisorReview)
def broadcast_supervisor_review(sender, instance, created, **kwargs):
    if instance.status == 'submitted':
        name = getattr(instance.employee, 'get_full_name', lambda: '')() or str(instance.employee_id)
        ReviewsEventBroadcaster.review_submitted(
            cycle_id=str(instance.review_cycle_id),
            employee_id=str(instance.employee_id),
            employee_name=name,
            review_type='supervisor_review',
        )
    elif instance.status == 'approved':
        approver = getattr(instance.reviewed_by, 'email', 'manager')
        name = getattr(instance.employee, 'get_full_name', lambda: '')() or str(instance.employee_id)
        ReviewsEventBroadcaster.review_approved(
            cycle_id=str(instance.review_cycle_id),
            employee_id=str(instance.employee_id),
            employee_name=name,
            approved_by=approver,
        )

@receiver(post_save, sender=FinalRating)
def broadcast_final_rating(sender, instance, created, **kwargs):
    if instance.status in ('approved', 'locked', 'completed'):
        ReviewsEventBroadcaster.review_completed(
            cycle_id=str(instance.review_cycle_id),
            employee_id=str(instance.employee_id),
            final_score=float(instance.final_score) if instance.final_score else None,
        )

@receiver(post_save, sender=FeedbackResponse)
def broadcast_feedback_submitted(sender, instance, created, **kwargs):
    if created:
        req = instance.feedback_request
        ReviewsEventBroadcaster.review_submitted(
            cycle_id=str(req.review_cycle_id),
            employee_id=str(req.subject_id),
            employee_name=str(req.subject_id),
            review_type='feedback',
        )


def _connect_cross_app_signals():
    """Wire Structure / Accounts / KPI changes into Reviews sync."""
    try:
        from apps.structure.models import Department

        @receiver(post_save, sender=Department)
        @receiver(post_delete, sender=Department)
        def structure_changed(sender, instance, **kwargs):
            ReviewsDependencySyncService.on_department_changed(
                instance.tenant_id, str(instance.id),
            )
    except Exception:
        pass

    try:
        from apps.accounts.models import User

        @receiver(post_save, sender=User)
        def user_changed(sender, instance, **kwargs):
            if getattr(instance, 'tenant_id', None):
                ReviewsDependencySyncService.on_user_changed(
                    instance.tenant_id, str(instance.id),
                )
    except Exception:
        pass

    try:
        from apps.kpi.models.calculation import Score

        @receiver(post_save, sender=Score)
        def kpi_score_changed(sender, instance, **kwargs):
            ReviewsDependencySyncService.on_kpi_score_changed(
                instance.tenant_id,
                str(instance.user_id),
                recalculate_final_ratings=True,
            )
    except Exception:
        pass


_connect_cross_app_signals()
