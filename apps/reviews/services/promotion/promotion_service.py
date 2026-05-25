from asyncio.log import logger

from django.utils import timezone
from django.core.exceptions import ValidationError
from ...models import PromotionRecommendation, FinalRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService

class PromotionService(BaseReviewService):
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_from_final_rating(final_rating_id, data=None):
        """
        Create a promotion recommendation from a final rating.
        
        Args:
            final_rating_id: FinalRating ID
            data: Optional additional data
        
        Returns:
            PromotionRecommendation object
        """
        final_rating = FinalRating.objects.get(id=final_rating_id)
        
        if not final_rating.promotion_recommended:
            raise ValidationError("No promotion recommendation on this final rating")
        
        # Check if promotion already exists for this cycle
        existing = PromotionRecommendation.objects.filter(
            tenant=final_rating.tenant,
            employee=final_rating.employee,
            review_cycle=final_rating.review_cycle
        ).first()
        
        if existing:
            raise ValidationError("Promotion recommendation already exists for this cycle")
        
        # Create promotion recommendation
        promotion_data = {
            'tenant': final_rating.tenant,
            'employee': final_rating.employee,
            'review_cycle': final_rating.review_cycle,
            'final_rating': final_rating,
            'recommended_by': final_rating.supervisor_review.supervisor if final_rating.supervisor_review else None,
            'current_role': final_rating.employee.position.title if final_rating.employee.position else '',
            'recommended_role': final_rating.promotion_target_role,
            'priority': 'medium',
            'justification': final_rating.supervisor_review.overall_comment if final_rating.supervisor_review else '',
            'status': 'pending'
        }
        
        # Override with custom data
        if data:
            promotion_data.update(data)
        
        promotion = PromotionRecommendation.objects.create(**promotion_data)
        
        # Notify HR
        NotificationService.notify_promotion_created(promotion)
        
        return promotion
    
    @staticmethod
    def get_employee_promotions(employee, status=None):
        """
        Get all promotion recommendations for an employee.
        
        Args:
            employee: User object
            status: Optional status filter
        
        Returns:
            QuerySet of PromotionRecommendation objects
        """
        queryset = PromotionRecommendation.objects.filter(employee=employee)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-recommended_date')
    
    @staticmethod
    def get_pending_promotions(tenant):
        """
        Get all pending promotions for a tenant.
        
        Args:
            tenant: Client object
        
        Returns:
            QuerySet of PromotionRecommendation objects
        """
        return PromotionRecommendation.objects.filter(
            tenant=tenant,
            status='pending'
        ).select_related('employee', 'review_cycle').order_by('-recommended_date')
    
    @staticmethod
    def get_approved_promotions(tenant, from_date=None, to_date=None):
        """
        Get approved promotions within a date range.
        
        Args:
            tenant: Client object
            from_date: Optional start date
            to_date: Optional end date
        
        Returns:
            QuerySet of PromotionRecommendation objects
        """
        queryset = PromotionRecommendation.objects.filter(
            tenant=tenant,
            status='approved'
        )
        
        if from_date:
            queryset = queryset.filter(approved_at__date__gte=from_date)
        
        if to_date:
            queryset = queryset.filter(approved_at__date__lte=to_date)
        
        return queryset.select_related('employee', 'review_cycle').order_by('-approved_at')
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def approve_promotion(promotion_id, approved_by, approved_date=None, notes=None):
        """
        Approve a promotion recommendation.
        
        Args:
            promotion_id: PromotionRecommendation ID
            approved_by: User approving
            approved_date: Date of approval (defaults to today)
            notes: Optional approval notes
        
        Returns:
            PromotionRecommendation object
        """
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
        
        # Notify employee and manager
        NotificationService.notify_promotion_approved(promotion)
        
        return promotion
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def reject_promotion(promotion_id, rejected_by, reason):
        """
        Reject a promotion recommendation.
        
        Args:
            promotion_id: PromotionRecommendation ID
            rejected_by: User rejecting
            reason: Rejection reason
        
        Returns:
            PromotionRecommendation object
        """
        promotion = PromotionRecommendation.objects.get(id=promotion_id)
        
        if promotion.status != 'pending':
            raise ValidationError(f"Cannot reject promotion with status: {promotion.status}")
        
        promotion.status = 'rejected'
        promotion.approved_by = rejected_by
        promotion.approved_at = timezone.now()
        promotion.rejection_reason = reason
        promotion.save()
        
        # Notify employee and manager
        NotificationService.notify_promotion_rejected(promotion, reason)
        
        return promotion
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def mark_completed(promotion_id, actual_date=None, new_salary=None):
        """
        Mark a promotion as completed (employee was promoted).
        
        Args:
            promotion_id: PromotionRecommendation ID
            actual_date: Date promotion took effect (defaults to today)
            new_salary: New salary after promotion
        
        Returns:
            PromotionRecommendation object
        """
        promotion = PromotionRecommendation.objects.get(id=promotion_id)
        
        if promotion.status != 'approved':
            raise ValidationError("Only approved promotions can be marked as completed")
        
        promotion.status = 'completed'
        promotion.actual_promotion_date = actual_date or timezone.now().date()
        
        if new_salary:
            promotion.proposed_salary = new_salary
        
        promotion.save()
        
        # Update employee's position/role if needed
        if promotion.recommended_role:
            # This would update the employee's position in the Structure app
            PromotionService._update_employee_position(promotion.employee, promotion.recommended_role)
        
        return promotion
    
    @staticmethod
    def _update_employee_position(employee, new_role):
        try:
            from apps.structure.services import PositionService
            return PositionService.update_employee_position(employee, new_role)
        except ImportError as e:
            logger.warning(f"PositionService not available: {e}")
            return False
        except Exception as e:
            logger.error(f"Error updating employee position: {e}")
            return False
    
    @staticmethod
    def get_promotion_statistics(tenant, year=None):
        """
        Get promotion statistics for a tenant.
        
        Args:
            tenant: Client object
            year: Optional year filter
        
        Returns:
            dict: Promotion statistics
        """
        from django.db.models import Count
        
        queryset = PromotionRecommendation.objects.filter(tenant=tenant)
        
        if year:
            queryset = queryset.filter(approved_at__year=year)
        
        stats = {
            'total_pending': queryset.filter(status='pending').count(),
            'total_approved': queryset.filter(status='approved').count(),
            'total_rejected': queryset.filter(status='rejected').count(),
            'total_completed': queryset.filter(status='completed').count(),
            'by_department': {},
            'by_priority': {},
            'average_timeline_days': None
        }
        
        # By department
        dept_stats = queryset.filter(
            employee__department__isnull=False
        ).values('employee__department__name').annotate(
            count=Count('id')
        )
        
        for item in dept_stats:
            stats['by_department'][item['employee__department__name']] = item['count']
        
        # By priority
        priority_stats = queryset.values('priority').annotate(count=Count('id'))
        for item in priority_stats:
            stats['by_priority'][item['priority']] = item['count']
        
        # Average timeline (approved to completed)
        completed = queryset.filter(
            status='completed',
            approved_at__isnull=False,
            actual_promotion_date__isnull=False
        )
        
        if completed.exists():
            total_days = 0
            for promo in completed:
                days = (promo.actual_promotion_date - promo.approved_at.date()).days
                total_days += days
            stats['average_timeline_days'] = round(total_days / completed.count(), 1)
        
        return stats