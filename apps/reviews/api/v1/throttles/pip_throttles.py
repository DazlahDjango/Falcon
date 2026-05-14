# apps/reviews/api/v1/throttles/pip_throttles.py
"""
Throttle classes for PIP (Performance Improvement Plan) endpoints
"""
from apps.accounts.api.v1.throttles import UserRateThrottle

class PIPCreationThrottle(UserRateThrottle):
    """
    Limits how often PIPs can be created for an employee.
    Rate: 2 PIPs per month per employee (enforced at manager level)
    """
    scope = 'pip_creation'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            employee_id = request.data.get('employee_id', '')
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"{request.user.id}_{employee_id}"
            }
        return None


class PIPActionThrottle(UserRateThrottle):
    """
    Limits PIP action updates (completing tasks, adding notes).
    Rate: 20 actions per hour
    """
    scope = 'pip_action'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            pip_id = view.kwargs.get('pip_id', '')
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"{request.user.id}_{pip_id}"
            }
        return None


class PIPApprovalThrottle(UserRateThrottle):
    """
    Limits PIP approval/rejection actions.
    Rate: 10 approvals per hour
    """
    scope = 'pip_approval'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        return None


class PIPCommentThrottle(UserRateThrottle):
    """
    Limits comments on PIPs to prevent spam.
    Rate: 30 comments per hour
    """
    scope = 'pip_comment'
    rate = '30/hour'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            pip_id = view.kwargs.get('pip_id', '')
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"{request.user.id}_{pip_id}"
            }
        return None