import logging
from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import PromotionRecommendation, FinalRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService
logger = logging.getLogger(__name__)

class PromotionService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_from_final_rating(final_rating_id, data=None):
        final_rating = FinalRating.objects.get(id=final_rating_id)
        if not final_rating.promotion_recommended:
            raise ValidationError("No promotion recommendation on this final rating")
        existing = PromotionRecommendation.objects.filter(tenant_id=final_rating.tenant_id, employee=final_rating.employee, review_cycle=final_rating.review_cycle).first()
        if existing:
            raise ValidationError("Promotion recommendation already exists for this cycle")
        employee_title = getattr(final_rating.employee, 'title', None) or getattr(final_rating.employee, 'position', '') or ''
        promotion_data = {'tenant_id': final_rating.tenant_id, 'employee': final_rating.employee, 'review_cycle': final_rating.review_cycle, 'final_rating': final_rating, 'recommended_by': final_rating.supervisor_review.supervisor if final_rating.supervisor_review else None, 'current_role': employee_title, 'recommended_role': final_rating.promotion_target_role or 'Senior Level', 'priority': 'medium', 'justification': final_rating.supervisor_review.overall_comment if final_rating.supervisor_review else '', 'status': 'pending'}
        if data:
            promotion_data.update(data)
        promotion = PromotionRecommendation.objects.create(**promotion_data)
        NotificationService.notify_promotion_created(promotion)
        return promotion
    @staticmethod
    def get_employee_promotions(employee, status=None):
        queryset = PromotionRecommendation.objects.filter(employee=employee)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('-recommended_date')
    @staticmethod
    def get_pending_promotions(tenant):
        return PromotionRecommendation.objects.filter(tenant_id=tenant.id, status='pending').select_related('employee', 'review_cycle').order_by('-recommended_date')
    @staticmethod
    def get_approved_promotions(tenant, from_date=None, to_date=None):
        queryset = PromotionRecommendation.objects.filter(tenant_id=tenant.id, status='approved')
        if from_date:
            queryset = queryset.filter(approved_at__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(approved_at__date__lte=to_date)
        return queryset.select_related('employee', 'review_cycle').order_by('-approved_at')
    @staticmethod
    @BaseReviewService.atomic_operation
    def approve_promotion(promotion_id, approved_by, approved_date=None, notes=None):
        promotion = PromotionRecommendation.objects.get(id=promotion_id)
        if promotion.status != 'pending':
            raise ValidationError(f"Cannot approve promotion with status: {promotion.status}")
        promotion.status = 'approved'
        promotion.approved_by = approved_by
        promotion.approved_at = timezone.now()
        if approved_date:
            promotion.approved_at = approved_date
        if notes:
            promotion.status_notes = notes
        promotion.save()
        NotificationService.notify_promotion_approved(promotion)
        return promotion
    @staticmethod
    @BaseReviewService.atomic_operation
    def reject_promotion(promotion_id, rejected_by, reason):
        promotion = PromotionRecommendation.objects.get(id=promotion_id)
        if promotion.status != 'pending':
            raise ValidationError(f"Cannot reject promotion with status: {promotion.status}")
        promotion.status = 'rejected'
        promotion.approved_by = rejected_by
        promotion.approved_at = timezone.now()
        promotion.rejection_reason = reason
        promotion.save()
        NotificationService.notify_promotion_rejected(promotion, reason)
        return promotion
    @staticmethod
    @BaseReviewService.atomic_operation
    def mark_completed(promotion_id, actual_date=None, new_salary=None):
        promotion = PromotionRecommendation.objects.get(id=promotion_id)
        if promotion.status != 'approved':
            raise ValidationError("Only approved promotions can be marked as completed")
        promotion.status = 'completed'
        promotion.actual_promotion_date = actual_date or timezone.now().date()
        if new_salary:
            promotion.proposed_salary = new_salary
        promotion.save()
        return promotion
    @staticmethod
    def get_promotion_statistics(tenant, year=None):
        from django.db.models import Count
        queryset = PromotionRecommendation.objects.filter(tenant_id=tenant.id)
        if year:
            queryset = queryset.filter(approved_at__year=year)
        stats = {'total_pending': queryset.filter(status='pending').count(), 'total_approved': queryset.filter(status='approved').count(), 'total_rejected': queryset.filter(status='rejected').count(), 'total_completed': queryset.filter(status='completed').count(), 'by_department': {}, 'by_priority': {}, 'average_timeline_days': None}
        dept_stats = queryset.filter(employee__department__isnull=False).exclude(employee__department='').values('employee__department').annotate(count=Count('id'))
        for item in dept_stats:
            stats['by_department'][item['employee__department']] = item['count']
        priority_stats = queryset.values('priority').annotate(count=Count('id'))
        for item in priority_stats:
            stats['by_priority'][item['priority']] = item['count']
        completed = queryset.filter(status='completed', approved_at__isnull=False, actual_promotion_date__isnull=False)
        if completed.exists():
            total_days = 0
            for promo in completed:
                days = (promo.actual_promotion_date - promo.approved_at.date()).days
                total_days += days
            stats['average_timeline_days'] = round(total_days / completed.count(), 1)
        return stats