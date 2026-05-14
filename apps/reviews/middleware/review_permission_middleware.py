# apps/reviews/middleware/review_permission_middleware.py
"""
Middleware for review-specific permission checks
Uses services for permission validation
"""

from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import AnonymousUser

from apps.reviews.services.assessment.self_assessment_service import SelfAssessmentService
from apps.reviews.services.assessment.supervisor_review_service import SupervisorReviewService
from apps.reviews.services.pip.pip_service import PIPService
from apps.reviews.services.calibration.calibration_service import CalibrationService


class ReviewPermissionMiddleware(MiddlewareMixin):
    """
    Checks permissions for review-related URLs.
    Ensures users can only access reviews they're authorized for.
    """
    
    # URL patterns that require review access verification
    PROTECTED_PATTERNS = [
        'self-assessment',
        'supervisor-review',
        'final-rating',
        'pip',
        'calibration',
        'feedback',
    ]
    
    def process_request(self, request):
        """
        Check permissions for review-related requests.
        """
        # Skip for non-authenticated users
        if not hasattr(request, 'user') or isinstance(request.user, AnonymousUser):
            return None
        
        # Get current URL path
        path = request.path_info
        
        # Check if this is a review-related URL
        is_review_url = any(pattern in path for pattern in self.PROTECTED_PATTERNS)
        
        if not is_review_url:
            return None
        
        # Extract IDs from URL
        cycle_id = self._extract_cycle_id(path)
        assessment_id = self._extract_assessment_id(path)
        session_id = self._extract_session_id(path)
        pip_id = self._extract_pip_id(path)
        
        # Check permissions based on URL type
        if 'self-assessment' in path:
            if not self._can_access_self_assessment(request.user, assessment_id, cycle_id):
                raise PermissionDenied("You don't have permission to access this self-assessment")
        
        elif 'supervisor-review' in path:
            if not self._can_access_supervisor_review(request.user, assessment_id, cycle_id):
                raise PermissionDenied("You don't have permission to access this review")
        
        elif 'calibration' in path:
            if not self._can_access_calibration(request.user, session_id):
                raise PermissionDenied("You don't have permission to access this calibration session")
        
        elif 'pip' in path:
            if not self._can_access_pip(request.user, pip_id):
                raise PermissionDenied("You don't have permission to access this PIP")
        
        return None
    
    def _extract_cycle_id(self, path):
        """Extract cycle ID from URL path"""
        import re
        match = re.search(r'/cycle/([\w-]+)/', path)
        return match.group(1) if match else None
    
    def _extract_assessment_id(self, path):
        """Extract assessment ID from URL path"""
        import re
        match = re.search(r'/assessment/([\w-]+)/', path)
        return match.group(1) if match else None
    
    def _extract_session_id(self, path):
        """Extract session ID from URL path"""
        import re
        match = re.search(r'/session/([\w-]+)/', path)
        return match.group(1) if match else None
    
    def _extract_pip_id(self, path):
        """Extract PIP ID from URL path"""
        import re
        match = re.search(r'/pip/([\w-]+)/', path)
        return match.group(1) if match else None
    
    def _can_access_self_assessment(self, user, assessment_id, cycle_id):
        """Check if user can access self-assessment"""
        from apps.reviews.models import SelfAssessment, ReviewCycle
        
        # Employee can access their own
        if assessment_id:
            try:
                assessment = SelfAssessment.objects.get(id=assessment_id)
                if assessment.employee_id == user.id:
                    return True
            except SelfAssessment.DoesNotExist:
                pass
        
        # Manager can access their team's
        if user.role in ['manager', 'admin', 'executive', 'hr']:
            if cycle_id:
                try:
                    cycle = ReviewCycle.objects.get(id=cycle_id)
                    return cycle.supervisor_reviews.filter(supervisor=user).exists()
                except ReviewCycle.DoesNotExist:
                    pass
        
        # Admin/HR have full access
        if user.role in ['admin', 'super_admin', 'hr']:
            return True
        
        return False
    
    def _can_access_supervisor_review(self, user, review_id, cycle_id):
        """Check if user can access supervisor review"""
        from apps.reviews.models import SupervisorReview, ReviewCycle
        
        # The supervisor themselves can access
        if review_id:
            try:
                review = SupervisorReview.objects.get(id=review_id)
                if review.supervisor_id == user.id:
                    return True
            except SupervisorReview.DoesNotExist:
                pass
        
        # Employee can see their own review
        if review_id:
            try:
                review = SupervisorReview.objects.get(id=review_id)
                if review.employee_id == user.id:
                    return True
            except SupervisorReview.DoesNotExist:
                pass
        
        # Manager can access their team's reviews
        if user.role in ['manager', 'admin', 'executive', 'hr']:
            if cycle_id:
                try:
                    cycle = ReviewCycle.objects.get(id=cycle_id)
                    return cycle.supervisor_reviews.filter(supervisor=user).exists()
                except ReviewCycle.DoesNotExist:
                    pass
        
        # Admin/HR have full access
        if user.role in ['admin', 'super_admin', 'hr']:
            return True
        
        return False
    
    def _can_access_calibration(self, user, session_id):
        """Check if user can access calibration session using CalibrationService"""
        if not session_id:
            return user.role in ['admin', 'super_admin', 'hr']
        
        try:
            session = CalibrationService.get_session(session_id)
            if not session:
                return False
            
            # Facilitator can access
            if session.facilitator_id == user.id:
                return True
            
            # Participant can access
            if session.participants.filter(id=user.id).exists():
                return True
            
            # Admin/HR can access
            if user.role in ['admin', 'super_admin', 'hr']:
                return True
            
        except Exception:
            pass
        
        return False
    
    def _can_access_pip(self, user, pip_id):
        """Check if user can access PIP using PIPService"""
        if not pip_id:
            return user.role in ['admin', 'super_admin', 'hr', 'manager']
        
        try:
            pip = PIPService.get_pip(pip_id)
            if not pip:
                return False
            
            # Employee can access their own PIP
            if pip.employee_id == user.id:
                return True
            
            # Owner (manager) can access
            if pip.owner_id == user.id:
                return True
            
            # Admin/HR can access
            if user.role in ['admin', 'super_admin', 'hr']:
                return True
            
        except Exception:
            pass
        
        return False


class ReviewAPIPermissionMiddleware(MiddlewareMixin):
    """
    Middleware to check API permissions for review endpoints.
    Validates JWT token and review-specific permissions.
    """
    
    def process_request(self, request):
        """
        Check API permissions for review endpoints.
        """
        # Only process API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Skip for non-review APIs
        if '/reviews/' not in request.path:
            return None
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required for review API access")
        
        # Get tenant from header or user
        tenant_id = request.headers.get('X-Tenant-ID')
        
        if tenant_id and str(request.user.tenant_id) != tenant_id:
            raise PermissionDenied("Tenant mismatch")
        
        return None