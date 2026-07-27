from prometheus_client import Counter, Gauge, Histogram, generate_latest
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

# Define metrics
kpi_requests_total = Counter(
    'kpi_requests_total',
    'Total number of KPI requests',
    ['method', 'endpoint', 'status']
)

kpi_request_duration = Histogram(
    'kpi_request_duration_seconds',
    'KPI request duration in seconds',
    ['method', 'endpoint']
)

kpi_scores_calculated = Counter(
    'kpi_scores_calculated_total',
    'Total number of scores calculated',
    ['tenant_id']
)

active_kpis = Gauge(
    'active_kpis',
    'Number of active KPIs',
    ['tenant_id']
)

pending_validations = Gauge(
    'pending_validations',
    'Number of pending validations',
    ['tenant_id']
)

red_alerts = Gauge(
    'red_alerts',
    'Number of red alerts',
    ['tenant_id']
)

celery_queue_size = Gauge(
    'celery_queue_size',
    'Celery queue size',
    ['queue']
)

database_connections = Gauge(
    'database_connections',
    'Number of database connections'
)

redis_memory_usage = Gauge(
    'redis_memory_usage_bytes',
    'Redis memory usage in bytes'
)


@csrf_exempt
def metrics_view(request):
    """Export metrics for Prometheus"""
    # Update metrics before exporting
    update_metrics()
    return HttpResponse(generate_latest(), content_type='text/plain')


def update_metrics():
    """Update metric values"""
    from django.db import connection
    from .models import KPI, MonthlyActual, TrafficLight
    from django.core.cache import cache
    import redis

    # Update active KPIs per tenant
    from apps.tenant.models import Organization
    for tenant in Organization.objects.filter(is_active=True):
        count = KPI.objects.filter(tenant_id=tenant.id, is_active=True).count()
        active_kpis.labels(tenant_id=str(tenant.id)).set(count)

        pending = MonthlyActual.objects.filter(
            tenant_id=tenant.id,
            status='PENDING'
        ).count()
        pending_validations.labels(tenant_id=str(tenant.id)).set(pending)

        red = TrafficLight.objects.filter(
            score__tenant_id=tenant.id,
            status='RED'
        ).count()
        red_alerts.labels(tenant_id=str(tenant.id)).set(red)

    # Update database connections
    database_connections.set(len(connection.connection_pool._connections))

    # Update Redis metrics
    try:
        redis_client = redis.Redis.from_url(settings.REDIS_URL)
        info = redis_client.info()
        redis_memory_usage.set(info.get('used_memory', 0))
    except Exception:
        pass