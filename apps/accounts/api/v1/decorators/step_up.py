from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from apps.accounts.services.auth.step_up_service import step_up_service

def require_step_up(action_name: str, message: str = None):
    """
    Decorator for views that require step-up MFA authentication.
    
    Usage:
        @require_step_up('delete_user', message='Deleting a user requires MFA verification')
        def delete(self, request, user_id):
            ...
    
    The client will receive a 401 response with a 'step_up_required' flag
    and should then prompt the user for MFA and call the step-up verification endpoint.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            user = request.user
            
            if not user or not user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            if step_up_service.require_step_up(user, action_name):
                default_message = f"Step-up authentication required for: {action_name}"
                return Response(
                    {
                        'step_up_required': True,
                        'action': action_name,
                        'message': message or default_message,
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            return view_func(self, request, *args, **kwargs)
        return wrapped_view
    return decorator

def optional_step_up(action_name: str, cache_ttl: int = 300):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            user = request.user
            if user and user.is_authenticated:
                cache_key = f"step_up_verified:{user.id}:{action_name}"
                if request.headers.get('X-Step-Up-Token'):
                    verified = cache.get(cache_key)
                    if verified:
                        return view_func(self, request, *args, **kwargs)
                response = view_func(self, request, *args, **kwargs)
                if response.status_code == 200 and not cache.get(cache_key):
                    response.data = response.data or {}
                    response.data['step_up_available'] = True
                    response.data['step_up_action'] = action_name
                return response
            return view_func(self, request, *args, **kwargs)
        return wrapped_view
    return decorator