from django.shortcuts import render

def home_view(request):
    """
    A simple landing page to welcome users and avoid 404s on the root URL.
    """
    return render(request, 'home.html')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.core.cache import cache
from django.utils import timezone

@csrf_exempt
def health_check(request):
    """Production-ready real-time health check endpoint for platform core services."""
    status_code = 200
    overall_status = 'healthy'
    checks = {'api': 'running'}

    # Real-time Database Query Check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks['database'] = 'connected'
    except Exception as e:
        checks['database'] = f'disconnected: {str(e)}'
        overall_status = 'unhealthy'
        status_code = 503

    # Real-time Cache Ping Check
    try:
        cache.set('core_health_ping', 'ok', 10)
        val = cache.get('core_health_ping')
        checks['cache'] = 'connected' if val == 'ok' else 'degraded'
        if val != 'ok' and overall_status == 'healthy':
            overall_status = 'degraded'
    except Exception as e:
        checks['cache'] = f'error: {str(e)}'
        if overall_status == 'healthy':
            overall_status = 'degraded'

    # Registered Apps Count Check
    try:
        from apps.configs.models import RegisteredApp
        checks['registered_apps_count'] = RegisteredApp.objects.filter(is_registered=True).count()
    except Exception:
        checks['registered_apps_count'] = 0

    return JsonResponse({
        'status': overall_status,
        'timestamp': timezone.now().isoformat(),
        'services': checks
    }, status=status_code)
