from django.shortcuts import render

def home_view(request):
    """
    A simple landing page to welcome users and avoid 404s on the root URL.
    """
    return render(request, 'home.html')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connections
from django.db.utils import OperationalError
import json
from datetime import datetime

@csrf_exempt
def health_check(request):
    """Simple health check endpoint returning JSON"""
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': 'unknown',
            'api': 'running'
        }
    }
    
    # Check database connection
    try:
        connections['default'].cursor()
        status['services']['database'] = 'connected'
    except OperationalError:
        status['status'] = 'degraded'
        status['services']['database'] = 'disconnected'
    
    return JsonResponse(status)
