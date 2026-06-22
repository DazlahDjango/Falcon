import logging
from typing import List, Dict, Optional, Any
from uuid import UUID
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

logger = logging.getLogger(__name__)

class PositionService:
    """Service for position-related business logic"""
    
    @staticmethod
    def get_position(position_id: UUID, tenant_id: UUID):
        """Get position by ID with tenant isolation"""
        from ..models import Position
        
        try:
            return Position.objects.get(
                id=position_id,
                tenant_id=tenant_id,
                is_deleted=False
            )
        except Position.DoesNotExist:
            return None
    
    @staticmethod
    def get_positions_by_tenant(tenant_id: UUID, include_vacant: bool = True):
        """Get all positions for a tenant"""
        from ..models import Position
        
        queryset = Position.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        
        if not include_vacant:
            queryset = queryset.filter(current_incumbents_count__gt=0)
        
        return queryset.order_by('job_code')
    
    @staticmethod
    def get_positions_by_department(department_id: UUID, tenant_id: UUID):
        """Get positions in a department"""
        from ..models import Position
        
        return Position.objects.filter(
            default_department_id=department_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('level', 'job_code')
    
    @staticmethod
    def get_positions_by_grade(grade: str, tenant_id: UUID):
        """Get positions by grade level"""
        from ..models import Position
        
        return Position.objects.filter(
            grade=grade,
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('job_code')
    
    @staticmethod
    def get_reporting_chain_up(position_id: UUID, tenant_id: UUID):
        """Get the reporting chain upwards from a position"""
        from ..models import Position
        
        chain = []
        current = PositionService.get_position(position_id, tenant_id)
        
        while current and current.reports_to:
            chain.append(current.reports_to)
            current = current.reports_to
        
        return chain
    
    @staticmethod
    def get_reporting_chain_down(position_id: UUID, tenant_id: UUID, max_depth: int = 10):
        """Get all positions that report to this position (downwards)"""
        from ..models import Position
        
        def _get_subordinates(parent_id: UUID, depth: int):
            if depth > max_depth:
                return []
            
            subordinates = Position.objects.filter(
                reports_to_id=parent_id,
                tenant_id=tenant_id,
                is_deleted=False
            )
            
            result = list(subordinates)
            for sub in subordinates:
                result.extend(_get_subordinates(sub.id, depth + 1))
            
            return result
        
        return _get_subordinates(position_id, 1)
    
    @staticmethod
    def get_incumbents(position_id: UUID, tenant_id: UUID):
        """Get current incumbents in a position"""
        from ..models import Position, Employment
        
        incumbents = Employment.objects.filter(
            position_id=position_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('user')
        
        incumbent_data = []
        for incumbent in incumbents:
            incumbent_data.append({
                'user_id': str(incumbent.user_id),
                'employment_id': str(incumbent.id),
                'user_name': incumbent.user.get_full_name() if incumbent.user else '',
                'effective_from': incumbent.effective_from,
                'is_manager': incumbent.is_manager
            })
        
        position = PositionService.get_position(position_id, tenant_id)
        
        return {
            'position_id': str(position_id),
            'position_code': position.job_code if position else '',
            'position_title': position.title if position else '',
            'current_incumbents': incumbent_data,
            'incumbent_count': len(incumbent_data),
            'max_incumbents': position.max_incumbents if position else 0,
            'is_single_incumbent': position.is_single_incumbent if position else False,
            'is_vacant': len(incumbent_data) == 0,
            'is_over_occupied': position and position.max_incumbents and len(incumbent_data) > position.max_incumbents
        }
    
    @staticmethod
    @transaction.atomic
    def update_employee_position(employee, new_position_title: str):
        """
        Update an employee's position.
        
        Args:
            employee: User object
            new_position_title: Title of new position
        
        Returns:
            bool: True if successful, False otherwise
        """
        from ..models import Position, Employment
        
        try:
            # Find position by title
            new_position = Position.objects.filter(
                title__iexact=new_position_title,
                tenant_id=employee.tenant_id,
                is_deleted=False
            ).first()
            
            if not new_position:
                logger.warning(f"Position '{new_position_title}' not found for tenant {employee.tenant_id}")
                return False
            
            # Update current employment
            current_employment = Employment.objects.filter(
                user_id=employee.id,
                tenant_id=employee.tenant_id,
                is_current=True,
                is_deleted=False
            ).first()
            
            if current_employment:
                current_employment.is_current = False
                current_employment.end_date = timezone.now().date()
                current_employment.save()
            
            # Create new employment record
            Employment.objects.create(
                user_id=employee.id,
                position=new_position,
                tenant_id=employee.tenant_id,
                is_current=True,
                is_active=True,
                effective_from=timezone.now().date(),
                is_manager=current_employment.is_manager if current_employment else False
            )
            
            # Update user's position reference if exists (depends on your User model)
            if hasattr(employee, 'position'):
                employee.position = new_position
                employee.save(update_fields=['position'])
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating employee position: {e}")
            return False
    
    @staticmethod
    def get_vacant_positions(tenant_id: UUID):
        """Get all vacant positions"""
        from ..models import Position
        
        return Position.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            current_incumbents_count=0
        ).order_by('level', 'job_code')
    
    @staticmethod
    def get_position_statistics(tenant_id: UUID):
        """Get statistics about positions"""
        from ..models import Position
        from django.db import models
        
        total = Position.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        vacant = Position.objects.filter(tenant_id=tenant_id, is_deleted=False, current_incumbents_count=0).count()
        occupied = total - vacant
        single_incumbent = Position.objects.filter(
            tenant_id=tenant_id, 
            is_deleted=False, 
            is_single_incumbent=True
        ).count()
        
        # Level distribution
        level_distribution = {}
        levels = Position.objects.filter(
            tenant_id=tenant_id, 
            is_deleted=False
        ).values('level').annotate(count=models.Count('id'))
        
        for level in levels:
            level_distribution[level['level']] = level['count']
        
        return {
            'total_positions': total,
            'vacant_positions': vacant,
            'occupied_positions': occupied,
            'single_incumbent_positions': single_incumbent,
            'occupancy_rate': round((occupied / total * 100), 2) if total > 0 else 0,
            'level_distribution': level_distribution
        }
    
    @staticmethod
    def get_employee_by_position(position_id: UUID, tenant_id: UUID):
        """Get all employees in a position"""
        from ..models import Employment
        
        employments = Employment.objects.filter(
            position_id=position_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('user')
        
        return [emp.user for emp in employments if emp.user]
    
    @staticmethod
    def get_manager_for_employee(employee):
        """Get the manager for an employee based on position hierarchy"""
        from ..models import Employment
        
        try:
            # Get employee's current position
            employment = Employment.objects.filter(
                user_id=employee.id,
                tenant_id=employee.tenant_id,
                is_current=True,
                is_deleted=False
            ).select_related('position').first()
            
            if not employment or not employment.position:
                return None
            
            # Get manager position (reports_to)
            manager_position = employment.position.reports_to
            if not manager_position:
                return None
            
            # Get the user in that manager position
            manager_employment = Employment.objects.filter(
                position=manager_position,
                tenant_id=employee.tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).select_related('user').first()
            
            return manager_employment.user if manager_employment else None
            
        except Exception as e:
            logger.error(f"Error getting manager for employee {employee.id}: {e}")
            return None
    
    @staticmethod
    def get_direct_reports(manager):
        """Get all direct reports for a manager"""
        from ..models import Position, Employment
        
        try:
            # Get manager's position
            manager_employment = Employment.objects.filter(
                user_id=manager.id,
                tenant_id=manager.tenant_id,
                is_current=True,
                is_deleted=False
            ).select_related('position').first()
            
            if not manager_employment or not manager_employment.position:
                return []
            
            # Find all positions that report to this manager's position
            subordinate_positions = Position.objects.filter(
                reports_to=manager_employment.position,
                tenant_id=manager.tenant_id,
                is_deleted=False
            )
            
            # Get employees in those positions
            employments = Employment.objects.filter(
                position__in=subordinate_positions,
                tenant_id=manager.tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).select_related('user')
            
            return [emp.user for emp in employments if emp.user]
            
        except Exception as e:
            logger.error(f"Error getting direct reports for manager {manager.id}: {e}")
            return []