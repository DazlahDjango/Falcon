from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from ...models import SelfAssessment, CompetencyRating
from ..base_service import BaseReviewService
from ..rating.score_calculator import ScoreCalculator
from ..notification.notification_service import NotificationService

class SelfAssessmentService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_or_update(employee, review_cycle, data, is_submit=False):
        assessment, created = SelfAssessment.objects.get_or_create(employee=employee, review_cycle=review_cycle, defaults={'status': 'draft', 'tenant_id': review_cycle.tenant_id})
        if assessment.status == 'submitted' and not review_cycle.allow_self_assessment_edit:
            raise ValidationError("Self assessment already submitted and cannot be edited")
        fields = ['overall_comment', 'strengths', 'areas_for_improvement', 'career_aspirations', 'challenges_faced', 'achievements', 'training_completed', 'training_requested', 'goals_achieved', 'goals_for_next_period']
        for field in fields:
            if field in data:
                setattr(assessment, field, data[field])
        if 'competency_ratings' in data:
            for rating_data in data['competency_ratings']:
                CompetencyRating.objects.update_or_create(content_type=ContentType.objects.get_for_model(SelfAssessment), object_id=str(assessment.id), competency_id=rating_data['competency_id'], defaults={'raw_score': rating_data['raw_score'], 'comment': rating_data.get('comment', '')})
        if is_submit and assessment.status != 'submitted':
            if timezone.now().date() > review_cycle.self_assessment_deadline:
                raise ValidationError("Self assessment deadline has passed")
            assessment.status = 'submitted'
            assessment.submitted_at = timezone.now()
        assessment.save()
        if is_submit:
            from apps.reviews.services.security.integrity import IntegrityService
            IntegrityService.apply_checksum(assessment, ['overall_comment', 'strengths', 'areas_for_improvement'], 'integrity_checksum')
            assessment.save(update_fields=['integrity_checksum'])
            NotificationService.notify_supervisor_review_ready(assessment)
        return assessment
    @staticmethod
    def get_for_manager(manager, review_cycle=None):
        direct_reports = manager.direct_reports.all()
        queryset = SelfAssessment.objects.filter(employee__in=direct_reports, status='submitted')
        if review_cycle:
            queryset = queryset.filter(review_cycle=review_cycle)
        return queryset
    @staticmethod
    def get_progress_stats(review_cycle):
        total_employees = review_cycle.get_participating_employees().count()
        submitted = SelfAssessment.objects.filter(review_cycle=review_cycle, status='submitted').count()
        return {'total_employees': total_employees, 'submitted': submitted, 'pending': total_employees - submitted, 'percentage': round((submitted / total_employees) * 100, 1) if total_employees > 0 else 0}