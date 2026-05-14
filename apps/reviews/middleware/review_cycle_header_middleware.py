# apps/reviews/middleware/review_cycle_header_middleware.py
"""
Middleware for handling review cycle headers in requests
Allows clients to specify which review cycle to operate on
"""

from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import PermissionDenied

from apps.reviews.models import ReviewCycle
from apps.reviews.services.cycle.cycle_service import CycleService


class ReviewCycleHeaderMiddleware(MiddlewareMixin):
    """
    Middleware that processes X-Review-Cycle-ID header.
    
    This middleware allows API clients to specify which review cycle
    they want to interact with by sending a header:
    
    X-Review-Cycle-ID: <cycle_uuid>
    
    The middleware then:
    1. Validates the cycle exists
    2. Checks tenant access
    3. Injects the cycle into request.review_cycle
    4. Also injects cycle progress data
    """
    
    # Header name to look for
    CYCLE_HEADER = 'HTTP_X_REVIEW_CYCLE_ID'
    
    def process_request(self, request):
        """
        Extract and validate review cycle from header.
        """
        # Get cycle ID from header
        cycle_id = request.META.get(self.CYCLE_HEADER)
        
        # If no header, use current cycle from context (set by ReviewContextMiddleware)
        if not cycle_id:
            request.review_cycle = getattr(request, 'current_review_cycle', None)
            request.cycle_progress = getattr(request, 'cycle_progress', None)
            return None
        
        # Try to get the cycle
        try:
            cycle = ReviewCycle.objects.get(id=cycle_id)
        except (ReviewCycle.DoesNotExist, ValueError):
            request.review_cycle = None
            request.cycle_progress = None
            request.invalid_cycle_error = f"Review cycle with id '{cycle_id}' does not exist"
            return None
        
        # Get tenant from request (set by tenant middleware)
        tenant = getattr(request, 'tenant', None)
        if not tenant and hasattr(request.user, 'tenant'):
            tenant = request.user.tenant
        
        # Check tenant access
        if tenant and cycle.tenant != tenant:
            request.review_cycle = None
            request.cycle_progress = None
            request.invalid_cycle_error = "You do not have access to this review cycle"
            return None
        
        # Cycle is valid - inject into request
        request.review_cycle = cycle
        request.invalid_cycle_error = None
        
        # Also inject cycle progress data using CycleService
        try:
            request.cycle_progress = CycleService.get_cycle_progress(cycle.id)
        except Exception:
            request.cycle_progress = None
        
        return None
    
    def process_response(self, request, response):
        """
        Add cycle info to response headers.
        """
        if hasattr(request, 'review_cycle') and request.review_cycle:
            response['X-Current-Review-Cycle'] = str(request.review_cycle.id)
            response['X-Current-Review-Cycle-Name'] = request.review_cycle.name
        
        if hasattr(request, 'invalid_cycle_error') and request.invalid_cycle_error:
            response['X-Cycle-Error'] = request.invalid_cycle_error
        
        return response


class ReviewCycleRequiredMiddleware(MiddlewareMixin):
    """
    Middleware that requires a valid review cycle for certain paths.
    Useful for endpoints that must have a cycle context.
    """
    
    # Paths that require a review cycle
    REQUIRED_PATHS = [
        '/api/reviews/self-assessment/',
        '/api/reviews/supervisor-review/',
        '/api/reviews/final-rating/',
        '/api/reviews/feedback/',
        '/api/reviews/calibration/',
    ]
    
    def process_request(self, request):
        """
        Check if current path requires a review cycle.
        """
        path = request.path_info
        
        # Check if this path requires a cycle
        requires_cycle = any(path.startswith(required) for required in self.REQUIRED_PATHS)
        
        if not requires_cycle:
            return None
        
        # Check if cycle exists in request
        review_cycle = getattr(request, 'review_cycle', None)
        
        if not review_cycle:
            raise PermissionDenied(
                "This endpoint requires a valid review cycle. "
                "Please provide X-Review-Cycle-ID header."
            )
        
        return None