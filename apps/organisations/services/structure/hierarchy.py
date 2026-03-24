from apps.organisations.models.hierarchy import Hierarchy
from django.db import transaction

class HierarchyService:
    @staticmethod
    def assign_supervisor(subordinate_user, supervisor_user, organisation):
        """
        Assigns or updates a supervisor for a user.
        Ensures a user only has one active direct supervisor in the hierarchy.
        """
        # A user cannot be their own supervisor
        if subordinate_user == supervisor_user:
            raise ValueError("A user cannot be their own supervisor.")

        with transaction.atomic():
            hierarchy, created = Hierarchy.objects.update_or_create(
                subordinate=subordinate_user,
                defaults={
                    'supervisor': supervisor_user,
                    'organisation': organisation
                }
            )
            return hierarchy

    @staticmethod
    def get_management_chain(user, max_depth=5):
        """
        Retrieves the chain of supervisors up to max_depth.
        Returns a list of User objects starting from the direct supervisor.
        """
        chain = []
        current_user = user
        depth = 0
        
        while depth < max_depth:
            hierarchy = Hierarchy.objects.filter(subordinate=current_user).first()
            if not hierarchy:
                break
            
            chain.append(hierarchy.supervisor)
            current_user = hierarchy.supervisor
            depth += 1
            
        return chain
