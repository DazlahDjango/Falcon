# apps/reviews/services/pip/pip_service.py
"""
PIP CRUD and business logic
"""

from django.utils import timezone
from django.core.exceptions import ValidationError

from ...models import PIP, PIPAction, FinalRating
from ..base_service import BaseReviewService
from ..notification.notification_service import NotificationService


class PIPService(BaseReviewService):
    """
    Handles CRUD and basic business logic for Performance Improvement Plans
    """
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def create_pip(employee, owner, review_cycle, data):
        """
        Create a new Performance Improvement Plan.
        
        Args:
            employee: User object (underperforming employee)
            owner: User object (manager/HR responsible)
            review_cycle: ReviewCycle object
            data: Dictionary with PIP data
        
        Returns:
            PIP object
        """
        # Check if employee already has an active PIP
        existing_active = PIP.objects.filter(
            employee=employee,
            status='active'
        ).exists()
        
        if existing_active:
            raise ValidationError("Employee already has an active PIP")
        
        # Create PIP
        pip = PIP.objects.create(
            tenant=employee.tenant,
            employee=employee,
            owner=owner,
            review_cycle=review_cycle,
            title=data.get('title'),
            description=data.get('description'),
            severity=data.get('severity', 'moderate'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            improvement_areas=data.get('improvement_areas'),
            success_criteria=data.get('success_criteria'),
            consequences_if_failed=data.get('consequences_if_failed'),
            consequences_if_successful=data.get('consequences_if_successful', ''),
            status='active'
        )
        
        # Create actions
        if 'actions' in data:
            for action_data in data['actions']:
                PIPAction.objects.create(
                    pip=pip,
                    title=action_data['title'],
                    description=action_data.get('description', ''),
                    priority=action_data.get('priority', 'medium'),
                    due_date=action_data['due_date'],
                    requires_evidence=action_data.get('requires_evidence', False)
                )
        
        # Send notifications
        NotificationService.notify_pip_created(pip)
        
        return pip
    
    @staticmethod
    def get_pip(pip_id):
        """Get a single PIP by ID"""
        try:
            return PIP.objects.get(id=pip_id)
        except PIP.DoesNotExist:
            return None
    
    @staticmethod
    def get_employee_pips(employee, status=None):
        """
        Get all PIPs for an employee.
        
        Args:
            employee: User object
            status: Optional status filter
        
        Returns:
            QuerySet of PIP objects
        """
        queryset = PIP.objects.filter(employee=employee)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')
    
    @staticmethod
    def get_manager_pips(manager, status=None):
        """
        Get all PIPs owned by a manager.
        
        Args:
            manager: User object
            status: Optional status filter
        
        Returns:
            QuerySet of PIP objects
        """
        queryset = PIP.objects.filter(owner=manager)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')
    
    @staticmethod
    def get_active_pips_for_tenant(tenant):
        """Get all active PIPs for a tenant"""
        return PIP.objects.filter(
            tenant=tenant,
            status='active'
        ).select_related('employee', 'owner')
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def update_pip(pip_id, data):
        """
        Update an existing PIP.
        
        Args:
            pip_id: PIP ID
            data: Dictionary with updated data
        
        Returns:
            PIP object
        """
        pip = PIP.objects.get(id=pip_id)
        
        if pip.status in ['completed', 'failed']:
            raise ValidationError("Cannot update completed or failed PIP")
        
        # Update fields
        updatable_fields = ['title', 'description', 'severity', 'improvement_areas',
                           'success_criteria', 'consequences_if_failed', 
                           'consequences_if_successful', 'success_metrics']
        
        for field in updatable_fields:
            if field in data:
                setattr(pip, field, data[field])
        
        # Handle extension
        if 'extended_to_date' in data:
            pip.extended_to_date = data['extended_to_date']
            pip.extension_reason = data.get('extension_reason', '')
        
        pip.save()
        
        return pip
    
    @staticmethod
    @BaseReviewService.atomic_operation
    def complete_pip(pip_id, outcome, notes=None):
        """
        Complete a PIP with success or failure outcome.
        
        Args:
            pip_id: PIP ID
            outcome: 'successful' or 'failed'
            notes: Optional outcome notes
        
        Returns:
            PIP object
        """
        pip = PIP.objects.get(id=pip_id)
        
        if pip.status != 'active':
            raise ValidationError("Only active PIPs can be completed")
        
        pip.status = 'completed'
        pip.outcome = outcome
        pip.outcome_notes = notes or ''
        pip.completed_at = timezone.now()
        pip.save()
        
        # Update final rating if this PIP came from one
        if pip.final_rating:
            if outcome == 'successful':
                # PIP completed successfully - update final rating action
                pip.final_rating.pip_recommended = False
            else:
                # PIP failed - escalate action
                pip.final_rating.action_outcome = 'terminate'
            
            pip.final_rating.save()
        
        # Send notification
        NotificationService.notify_pip_completed(pip)
        
        return pip