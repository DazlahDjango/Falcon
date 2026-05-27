from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff or request.user.is_superuser)


class IsOwnerOrReadOnly(BasePermission):
    """
    Object owners have full access.
    Others have read-only access.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # Check if user is the owner
        owner_attr = getattr(view, 'owner_attr', 'user')
        owner = getattr(obj, owner_attr, None)
        
        if owner and owner == request.user:
            return True
        
        # Admin can edit anything
        return bool(request.user and request.user.is_staff or request.user.is_superuser)


class IsTenantUser(BasePermission):
    """
    Ensures user belongs to the same tenant as the requested object.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get tenant from request or view
        tenant = getattr(request, 'tenant_id', None)
        
        if tenant and request.user.tenant_id != tenant:
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # Check if object has tenant attribute
        if hasattr(obj, 'tenant'):
            return obj.tenant == request.user.tenant_id
        
        # Check if object has user with tenant
        if hasattr(obj, 'user') and hasattr(obj.user, 'tenant_id'):
            return obj.user.tenant_id == request.user.tenant_id
        
        # Check if object has employee with tenant
        if hasattr(obj, 'employee') and hasattr(obj.employee, 'tenant_id'):
            return obj.employee.tenant_id == request.user.tenant_id
        
        return True


class IsSuperAdmin(BasePermission):
    """
    Allows access only to super admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)