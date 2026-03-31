"""
Permission to view tenant data
"""

from rest_framework.permissions import BasePermission


class CanViewTenant(BasePermission):
    """
    Allows access if the user belongs to the same tenant as the object.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super admins can view everything
        if request.user.is_superuser:
            return True
        
        # Check if the object belongs to the user's organisation
        if hasattr(obj, 'organisation'):
            return obj.organisation == request.user.organisation
        elif hasattr(obj, 'tenant'):
            return obj.tenant == request.user.organisation
        
        # If the object has no tenant reference, allow access only to super admins
        return False