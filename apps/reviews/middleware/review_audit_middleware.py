# apps/reviews/middleware/review_audit_middleware.py
"""
Middleware for auditing review-related actions
"""

from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
import json
import logging

logger = logging.getLogger(__name__)


class ReviewAuditMiddleware(MiddlewareMixin):
    """
    Logs all review-related actions for audit purposes.
    """
    
    # HTTP methods that modify data (should be audited)
    MODIFY_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    # URL patterns that should be audited
    AUDIT_PATTERNS = [
        'self-assessment',
        'supervisor-review',
        'final-rating',
        'pip',
        'calibration',
        'feedback',
        'rating',
        'cycle',
    ]
    
    def process_request(self, request):
        """
        Start audit context for the request.
        """
        # Only audit requests that modify data
        if request.method not in self.MODIFY_METHODS:
            return None
        
        # Check if this is a review-related URL
        path = request.path_info
        is_review_url = any(pattern in path for pattern in self.AUDIT_PATTERNS)
        
        if not is_review_url:
            return None
        
        # Store audit info in request for use in response
        request.audit_start_time = timezone.now()
        request.audit_method = request.method
        request.audit_path = path
        
        # Capture request body for audit (up to 1000 chars)
        if request.body:
            try:
                body_str = request.body.decode('utf-8')[:1000]
                request.audit_body = body_str
            except Exception:
                request.audit_body = ''
        
        return None
    
    def process_response(self, request, response):
        """
        Log the audited action after response is sent.
        """
        # Check if audit was started for this request
        if not hasattr(request, 'audit_start_time'):
            return response
        
        # Don't audit failed responses (4xx, 5xx)
        if response.status_code >= 400:
            return response
        
        # Prepare audit log entry
        audit_entry = {
            'timestamp': request.audit_start_time.isoformat(),
            'user_id': request.user.id if request.user.is_authenticated else None,
            'user_email': request.user.email if request.user.is_authenticated else None,
            'method': request.audit_method,
            'path': request.audit_path,
            'status_code': response.status_code,
            'client_ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        # Add request body if available
        if hasattr(request, 'audit_body') and request.audit_body:
            audit_entry['request_body'] = request.audit_body
        
        # Log to database or file
        self._save_audit_log(audit_entry)
        
        return response
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _save_audit_log(self, audit_entry):
        """Save audit log to database or file"""
        try:
            # Try to save to database via AuditLog model
            from apps.reviews.models import ReviewAuditLog
            ReviewAuditLog.objects.create(
                user_id=audit_entry['user_id'],
                action=audit_entry['method'],
                resource=audit_entry['path'],
                details=json.dumps(audit_entry),
                ip_address=audit_entry['client_ip'],
                user_agent=audit_entry['user_agent'],
                created_at=audit_entry['timestamp']
            )
        except (ImportError, Exception):
            # Fallback to file logging
            logger.info(f"AUDIT: {json.dumps(audit_entry)}")