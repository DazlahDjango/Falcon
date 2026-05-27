from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from apps.reviews.models import ReviewCycle
from apps.reviews.services.cycle.cycle_service import CycleService


class ReviewContextMiddleware(MiddlewareMixin):
    """
    Injects the current active review cycle into the request object.
    Uses CycleService to get cycle information.
    """
    
    def process_request(self, request):
        """
        Add current review cycle to request based on tenant and date.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            request.current_review_cycle = None
            return None
        
        # Get tenant from request (set by tenant middleware)
        tenant = getattr(request, 'tenant', None)
        if not tenant and hasattr(request.user, 'tenant'):
            tenant = request.user.tenant
        
        if not tenant:
            request.current_review_cycle = None
            return None
        
        # Find the current active review cycle for this tenant using CycleService
        today = timezone.now().date()
        
        try:
            # Use CycleService to get active cycle
            current_cycle = ReviewCycle.objects.filter(
                tenant=tenant,
                start_date__lte=today,
                end_date__gte=today,
                status='active'
            ).first()
            
            request.current_review_cycle = current_cycle
            
            # Also add upcoming and past cycles using CycleService
            request.upcoming_cycles = ReviewCycle.objects.filter(
                tenant=tenant,
                start_date__gt=today,
                status='active'
            ).order_by('start_date')[:5]
            
            request.recent_cycles = ReviewCycle.objects.filter(
                tenant=tenant,
                end_date__lt=today
            ).order_by('-end_date')[:5]
            
            # Add progress data if cycle exists
            if current_cycle:
                request.cycle_progress = CycleService.get_cycle_progress(current_cycle.id)
            
        except Exception:
            request.current_review_cycle = None
        
        return None
    
    def process_response(self, request, response):
        """
        Add cycle info to response context if using templates.
        """
        if hasattr(request, 'current_review_cycle') and request.current_review_cycle:
            response['X-Current-Review-Cycle'] = str(request.current_review_cycle.id)
            response['X-Current-Review-Cycle-Name'] = request.current_review_cycle.name
        
        return response


class ReviewCycleHeaderMiddleware(MiddlewareMixin):
    """
    Allows clients to specify a specific review cycle via header.
    Useful for API requests that need to target a specific cycle.
    Uses CycleService for validation.
    """
    
    def process_request(self, request):
        """
        Check for X-Review-Cycle-ID header and set request.review_cycle.
        """
        cycle_id = request.headers.get('X-Review-Cycle-ID')
        
        if cycle_id:
            try:
                from apps.reviews.models import ReviewCycle
                cycle = ReviewCycle.objects.get(id=cycle_id)
                
                # Check tenant access
                tenant = getattr(request, 'tenant', None)
                if tenant and cycle.tenant != tenant:
                    request.review_cycle = None
                else:
                    request.review_cycle = cycle
                    # Also add progress data
                    from apps.reviews.services.cycle.cycle_service import CycleService
                    request.cycle_progress = CycleService.get_cycle_progress(cycle.id)
            except ReviewCycle.DoesNotExist:
                request.review_cycle = None
        else:
            request.review_cycle = getattr(request, 'current_review_cycle', None)
        
        return None