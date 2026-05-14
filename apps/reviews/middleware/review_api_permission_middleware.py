# apps/reviews/middleware/review_api_permission_middleware.py
"""
Middleware for API permission checks on review endpoints
Validates JWT tokens, tenant access, and role-based permissions
"""

from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import AnonymousUser
import re


class ReviewAPIPermissionMiddleware(MiddlewareMixin):
    """
    Middleware to check API permissions for review endpoints.
    
    This middleware:
    1. Validates authentication for review API endpoints
    2. Checks tenant isolation (users can only access their tenant)
    3. Enforces role-based access control
    """
    
    # API paths that this middleware applies to
    API_PATHS = [
        '/api/reviews/',
        '/api/v1/reviews/',
    ]
    
    # Public endpoints that don't require authentication
    PUBLIC_ENDPOINTS = [
        '/api/reviews/public/',
        '/api/v1/reviews/health/',
        '/api/v1/reviews/cycles/public/',
    ]
    
    # Role-based endpoint access
    ROLE_REQUIREMENTS = {
        'self-assessment': ['staff', 'manager', 'executive', 'admin', 'hr'],
        'supervisor-review': ['manager', 'executive', 'admin', 'hr'],
        'final-rating': ['manager', 'executive', 'admin', 'hr'],
        'pip': ['manager', 'admin', 'hr'],
        'calibration': ['admin', 'hr', 'facilitator'],
        'feedback': ['staff', 'manager', 'admin', 'hr'],
        'cycle': ['admin', 'hr'],
        'reports': ['manager', 'executive', 'admin', 'hr'],
        'settings': ['admin', 'hr'],
    }
    
    def process_request(self, request):
        """
        Check API permissions for review endpoints.
        """
        path = request.path_info
        
        # Skip if not an API path
        if not self._is_review_api_path(path):
            return None
        
        # Check if endpoint is public
        if self._is_public_endpoint(path):
            return None
        
        # Check authentication
        if not request.user.is_authenticated or isinstance(request.user, AnonymousUser):
            raise PermissionDenied("Authentication required for review API access")
        
        # Check tenant isolation
        self._check_tenant_access(request)
        
        # Check role-based access
        self._check_role_access(request, path)
        
        return None
    
    def _is_review_api_path(self, path):
        """Check if path is a review API endpoint."""
        for api_path in self.API_PATHS:
            if api_path in path:
                return True
        return False
    
    def _is_public_endpoint(self, path):
        """Check if endpoint is public (no auth required)."""
        for public_path in self.PUBLIC_ENDPOINTS:
            if path.startswith(public_path):
                return True
        return False
    
    def _check_tenant_access(self, request):
        """
        Ensure user can only access their own tenant's data.
        """
        # Get tenant from header
        tenant_id = request.headers.get('X-Tenant-ID')
        
        if tenant_id:
            # Verify user belongs to this tenant
            if str(request.user.tenant_id) != tenant_id:
                raise PermissionDenied(
                    f"Tenant mismatch. User belongs to tenant {request.user.tenant_id}, "
                    f"but requested tenant {tenant_id}"
                )
        
        # If no header, user can only access their own tenant
        # This is enforced by the tenant middleware's tenant filtering
    
    def _check_role_access(self, request, path):
        """
        Check if user's role has access to this endpoint.
        """
        # Super admin has full access
        if request.user.role == 'super_admin':
            return
        
        # Find which resource this path belongs to
        resource = self._get_resource_from_path(path)
        
        if not resource:
            return  # No specific role requirement for this path
        
        # Get allowed roles for this resource
        allowed_roles = self.ROLE_REQUIREMENTS.get(resource, [])
        
        if not allowed_roles:
            return  # No restrictions
        
        # Check if user's role is allowed
        if request.user.role not in allowed_roles:
            raise PermissionDenied(
                f"Access denied. Role '{request.user.role}' does not have permission "
                f"to access {resource} endpoints. Required roles: {', '.join(allowed_roles)}"
            )
    
    def _get_resource_from_path(self, path):
        """
        Extract resource type from API path.
        """
        resource_patterns = {
            'self-assessment': r'/self-assessment/',
            'supervisor-review': r'/supervisor-review/',
            'final-rating': r'/final-rating/',
            'pip': r'/pip/',
            'calibration': r'/calibration/',
            'feedback': r'/feedback/',
            'cycle': r'/cycle/',
            'reports': r'/reports/',
            'settings': r'/settings/',
        }
        
        for resource, pattern in resource_patterns.items():
            if re.search(pattern, path):
                return resource
        
        return None


class ReviewObjectPermissionMiddleware(MiddlewareMixin):
    """
    Middleware for object-level permissions on review endpoints.
    Ensures users can only access specific objects they own or manage.
    """
    
    def process_request(self, request):
        """
        Check object-level permissions for specific IDs in URL.
        """
        path = request.path_info
        
        # Skip if not a review API path
        if '/reviews/' not in path:
            return None
        
        # Skip for non-authenticated users
        if not request.user.is_authenticated:
            return None
        
        # Check self-assessment object access
        if '/self-assessment/' in path:
            self._check_self_assessment_access(request, path)
        
        # Check supervisor review object access
        elif '/supervisor-review/' in path:
            self._check_supervisor_review_access(request, path)
        
        # Check PIP object access
        elif '/pip/' in path:
            self._check_pip_access(request, path)
        
        # Check calibration object access
        elif '/calibration/' in path:
            self._check_calibration_access(request, path)
        
        return None
    
    def _check_self_assessment_access(self, request, path):
        """
        Check if user can access a specific self assessment.
        """
        from apps.reviews.models import SelfAssessment
        
        # Extract assessment ID from URL
        import re
        match = re.search(r'/self-assessment/([\w-]+)/', path)
        if not match:
            return
        
        assessment_id = match.group(1)
        
        try:
            assessment = SelfAssessment.objects.get(id=assessment_id)
        except SelfAssessment.DoesNotExist:
            raise PermissionDenied("Self assessment not found")
        
        # Employee can access their own
        if assessment.employee_id == request.user.id:
            return
        
        # Manager can access their team's
        if request.user.role in ['manager', 'executive', 'admin', 'hr']:
            if assessment.employee.manager_id == request.user.id:
                return
        
        # Admin/HR have full access
        if request.user.role in ['admin', 'super_admin', 'hr']:
            return
        
        raise PermissionDenied("You do not have permission to access this self assessment")
    
    def _check_supervisor_review_access(self, request, path):
        """
        Check if user can access a specific supervisor review.
        """
        from apps.reviews.models import SupervisorReview
        
        import re
        match = re.search(r'/supervisor-review/([\w-]+)/', path)
        if not match:
            return
        
        review_id = match.group(1)
        
        try:
            review = SupervisorReview.objects.get(id=review_id)
        except SupervisorReview.DoesNotExist:
            raise PermissionDenied("Supervisor review not found")
        
        # Employee can see their own review
        if review.employee_id == request.user.id:
            return
        
        # Supervisor can access
        if review.supervisor_id == request.user.id:
            return
        
        # Admin/HR have full access
        if request.user.role in ['admin', 'super_admin', 'hr']:
            return
        
        raise PermissionDenied("You do not have permission to access this supervisor review")
    
    def _check_pip_access(self, request, path):
        """
        Check if user can access a specific PIP.
        """
        from apps.reviews.models import PIP
        
        import re
        match = re.search(r'/pip/([\w-]+)/', path)
        if not match:
            return
        
        pip_id = match.group(1)
        
        try:
            pip = PIP.objects.get(id=pip_id)
        except PIP.DoesNotExist:
            raise PermissionDenied("PIP not found")
        
        # Employee can access their own PIP
        if pip.employee_id == request.user.id:
            return
        
        # Owner (manager) can access
        if pip.owner_id == request.user.id:
            return
        
        # Admin/HR have full access
        if request.user.role in ['admin', 'super_admin', 'hr']:
            return
        
        raise PermissionDenied("You do not have permission to access this PIP")
    
    def _check_calibration_access(self, request, path):
        """
        Check if user can access a specific calibration session.
        """
        from apps.reviews.models import CalibrationSession
        
        import re
        match = re.search(r'/calibration/([\w-]+)/', path)
        if not match:
            return
        
        session_id = match.group(1)
        
        try:
            session = CalibrationSession.objects.get(id=session_id)
        except CalibrationSession.DoesNotExist:
            raise PermissionDenied("Calibration session not found")
        
        # Facilitator can access
        if session.facilitator_id == request.user.id:
            return
        
        # Participant can access
        if session.participants.filter(id=request.user.id).exists():
            return
        
        # Admin/HR have full access
        if request.user.role in ['admin', 'super_admin', 'hr']:
            return
        
        raise PermissionDenied("You do not have permission to access this calibration session")