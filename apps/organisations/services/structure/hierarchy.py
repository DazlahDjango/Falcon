"""
Hierarchy Service - Manages reporting relationships
"""

from django.db import transaction
from apps.organisations.models import Hierarchy


class HierarchyService:
    """
    Service for managing employee-supervisor relationships
    """
    
    @staticmethod
    def assign_supervisor(employee, supervisor, organisation):
        """
        Assigns or updates a supervisor for an employee.
        Ensures an employee only has one active direct supervisor.
        """
        # An employee cannot be their own supervisor
        if employee == supervisor:
            raise ValueError("An employee cannot be their own supervisor.")

        with transaction.atomic():
            hierarchy, created = Hierarchy.objects.update_or_create(
                employee=employee,
                defaults={
                    'supervisor': supervisor,
                    'organisation': organisation
                }
            )
            return hierarchy

    @staticmethod
    def get_management_chain(employee, max_depth=5):
        """
        Retrieves the chain of supervisors up to max_depth.
        Returns a list of User objects starting from the direct supervisor.
        """
        chain = []
        current_employee = employee
        depth = 0
        
        while depth < max_depth:
            hierarchy = Hierarchy.objects.filter(employee=current_employee).first()
            if not hierarchy or not hierarchy.supervisor:
                break
            
            chain.append(hierarchy.supervisor)
            current_employee = hierarchy.supervisor
            depth += 1
            
        return chain

    @staticmethod
    def get_direct_reports(supervisor, organisation=None):
        """
        Retrieves all employees who report directly to the given supervisor.
        """
        query = Hierarchy.objects.filter(supervisor=supervisor)
        if organisation:
            query = query.filter(organisation=organisation)
        return [h.employee for h in query]

    @staticmethod
    def get_full_reporting_tree(supervisor, organisation=None, max_depth=10):
        """
        Builds a recursive tree of reporting relationships starting from the given supervisor.
        Returns a dictionary structure:
        {
            'user': <UserObject>,
            'reports': [
                {'user': <Subordinate1>, 'reports': [...]},
                ...
            ]
        }
        """
        if max_depth <= 0:
            return {'user': supervisor, 'reports': []}

        reports = HierarchyService.get_direct_reports(supervisor, organisation)
        tree_reports = []
        for employee in reports:
            tree_reports.append(
                HierarchyService.get_full_reporting_tree(employee, organisation, max_depth - 1)
            )
        
        return {
            'user': supervisor,
            'reports': tree_reports
        }
    
    @staticmethod
    def get_org_chart(organisation, root_user=None):
        """
        Get the complete organisation chart
        """
        # Find CEO or top-level employees (those with no supervisor)
        if not root_user:
            top_level = Hierarchy.objects.filter(
                organisation=organisation
            ).exclude(
                employee__in=Hierarchy.objects.filter(
                    organisation=organisation
                ).values_list('supervisor', flat=True)
            )
            
            if top_level.exists():
                root_user = top_level.first().employee
        
        if root_user:
            return HierarchyService.get_full_reporting_tree(root_user, organisation)
        
        return {'user': None, 'reports': []}
    
    @staticmethod
    def remove_supervisor(employee, organisation):
        """
        Remove supervisor assignment for an employee
        """
        with transaction.atomic():
            deleted = Hierarchy.objects.filter(
                employee=employee,
                organisation=organisation
            ).delete()
            return deleted[0] > 0