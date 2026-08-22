"""
Accounts app URL configuration.
Routes for API and WebSocket endpoints.
"""
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.urls import path, include
from django.views.generic import TemplateView

from django.db import connection
from django.core.cache import cache
from django.utils import timezone
from apps.accounts.models import User

@csrf_exempt
def health_check(request):
    """Production-ready real-time health check for accounts service."""
    status_code = 200
    overall_status = 'healthy'
    checks = {}

    # Real-time Database Check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks['database'] = 'connected'
    except Exception as e:
        checks['database'] = f'error: {str(e)}'
        overall_status = 'unhealthy'
        status_code = 503

    # Real-time Cache Check
    try:
        cache.set('accounts_health_ping', 'ok', 10)
        cache_val = cache.get('accounts_health_ping')
        checks['cache'] = 'connected' if cache_val == 'ok' else 'degraded'
        if cache_val != 'ok' and overall_status == 'healthy':
            overall_status = 'degraded'
    except Exception as e:
        checks['cache'] = f'error: {str(e)}'
        if overall_status == 'healthy':
            overall_status = 'degraded'

    # Real-time User Analytics Metrics
    try:
        checks['metrics'] = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'verified_users': User.objects.filter(is_verified=True).count(),
        }
    except Exception as e:
        checks['metrics'] = f'error: {str(e)}'

    return JsonResponse({
        'status': overall_status,
        'service': 'accounts',
        'timestamp': timezone.now().isoformat(),
        'checks': checks
    }, status=status_code)

# API URL Patterns
# =================
urlpatterns = [
    # Health check endpoint
    path('accounts/health/', health_check, name='health'),
    # API v1 endpoints
    path('', include('apps.accounts.api.v1.urls')),
    path('accept-invitation/', TemplateView.as_view(template_name='accounts/accept_invitation.html'), name='accept_invitation'),
    path('verify-email/', TemplateView.as_view(template_name='accounts/verify_email.html'), name='verify_email'),
    path('reset-password/', TemplateView.as_view(template_name='accounts/reset_password.html'), name='reset_password'),
]