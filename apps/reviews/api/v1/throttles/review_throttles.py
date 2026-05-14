# apps/reviews/api/v1/throttles/review_throttles.py
"""
Throttle classes for review-related endpoints
"""

from rest_framework.throttling import SimpleRateThrottle
from apps.accounts.api.v1.throttles import UserRateThrottle


class ReviewSubmissionThrottle(UserRateThrottle):
    """
    Limits how often a user can submit reviews.
    Rate: 10 submissions per hour
    """
    scope = 'review_submission'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class ReviewApprovalThrottle(UserRateThrottle):
    """
    Limits how often a manager can approve reviews.
    Rate: 20 approvals per hour
    """
    scope = 'review_approval'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class FeedbackSubmissionThrottle(UserRateThrottle):
    """
    Limits how often a user can submit feedback.
    Rate: 5 feedback submissions per hour
    """
    scope = 'feedback_submission'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class CalibrationActionThrottle(UserRateThrottle):
    """
    Limits calibration session actions.
    Rate: 30 actions per minute (for live sessions)
    """
    scope = 'calibration_action'
    rate = '30/min'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            session_id = view.kwargs.get('session_id', '')
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"{request.user.id}_{session_id}"
            }
        return None


class ReviewExportThrottle(UserRateThrottle):
    """
    Limits review export requests.
    Rate: 5 exports per hour
    """
    scope = 'review_export'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class BulkReviewOperationThrottle(UserRateThrottle):
    """
    Limits bulk review operations.
    Rate: 3 bulk operations per hour
    """
    scope = 'bulk_review'
    rate = '3/hour'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None