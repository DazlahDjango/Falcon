"""
Security signals: field encryption, integrity checksums, audit trail.
"""

from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver

from apps.reviews.models import ReviewComment, FeedbackResponse, SelfAssessment
from apps.reviews.services.security import ReviewFieldEncryptionService, IntegrityService
from apps.reviews.services.audit import ReviewAuditService

COMMENT_FIELDS = ['comment']
SELF_ASSESSMENT_TEXT_FIELDS = [
    'overall_comment', 'strengths', 'areas_for_improvement',
    'career_aspirations', 'challenges_faced', 'achievements',
    'training_completed', 'training_requested',
]
FEEDBACK_RESPONSE_TEXT_FIELDS = [
    'strengths', 'areas_for_improvement', 'specific_examples',
    'suggestions', 'additional_comments',
]


@receiver(pre_save, sender=ReviewComment)
def encrypt_review_comment(sender, instance, **kwargs):
    ReviewFieldEncryptionService.encrypt_model_text_fields(instance, COMMENT_FIELDS)
    IntegrityService.apply_checksum(instance, COMMENT_FIELDS)


@receiver(pre_save, sender=SelfAssessment)
def encrypt_self_assessment(sender, instance, **kwargs):
    ReviewFieldEncryptionService.encrypt_model_text_fields(
        instance, SELF_ASSESSMENT_TEXT_FIELDS,
    )
    IntegrityService.apply_checksum(instance, SELF_ASSESSMENT_TEXT_FIELDS)


@receiver(pre_save, sender=FeedbackResponse)
def encrypt_feedback_response(sender, instance, **kwargs):
    ReviewFieldEncryptionService.encrypt_model_text_fields(
        instance, FEEDBACK_RESPONSE_TEXT_FIELDS,
    )
    IntegrityService.apply_checksum(instance, FEEDBACK_RESPONSE_TEXT_FIELDS)


def _audit_post_save(sender, instance, created, field_names, **kwargs):
    action = ReviewAuditService.ACTION_CREATE if created else ReviewAuditService.ACTION_UPDATE
    ReviewAuditService.log(
        model_name=sender.__name__,
        object_id=instance.id,
        action=action,
        tenant_id=getattr(instance, 'tenant_id', None),
        instance=instance,
        checksum_fields=field_names,
    )


@receiver(post_save, sender=ReviewComment)
def audit_review_comment(sender, instance, created, **kwargs):
    _audit_post_save(sender, instance, created, COMMENT_FIELDS)


@receiver(post_save, sender=SelfAssessment)
def audit_self_assessment(sender, instance, created, **kwargs):
    _audit_post_save(sender, instance, created, SELF_ASSESSMENT_TEXT_FIELDS)


@receiver(post_save, sender=FeedbackResponse)
def audit_feedback_response(sender, instance, created, **kwargs):
    _audit_post_save(sender, instance, created, FEEDBACK_RESPONSE_TEXT_FIELDS)


@receiver(pre_delete, sender=ReviewComment)
@receiver(pre_delete, sender=SelfAssessment)
@receiver(pre_delete, sender=FeedbackResponse)
def audit_delete(sender, instance, **kwargs):
    ReviewAuditService.log(
        model_name=sender.__name__,
        object_id=instance.id,
        action=ReviewAuditService.ACTION_DELETE,
        tenant_id=getattr(instance, 'tenant_id', None),
    )
