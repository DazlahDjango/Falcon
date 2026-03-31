"""
Permission for client admin users
"""

from rest_framework.permissions import BasePermission


class IsClientAdmin(BasePermission):
    """
    Allows access only to client admin users.
    A client admin is a user with the 'admin' role in their organisation.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admins have access to everything
        if request.user.is_superuser:
            return True
        
        # Check if user has admin role
        # This assumes you have a role system in accounts app
        return hasattr(request.user, 'role') and request.user.role in ['admin', 'client_admin', 'dashboard_champion']
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admins have access
        if request.user.is_superuser:
            return True
        
        # Check if the object belongs to the user's organisation
        if hasattr(obj, 'organisation'):
            return obj.organisation == request.user.organisation
        
        return False