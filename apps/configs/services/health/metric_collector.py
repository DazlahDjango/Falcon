from django.utils import timezone
from django.db import connection
from django.core.cache import cache
from datetime import timedelta
import psutil
import json

class MetricCollector:
    def collect_system_metrics(self):
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'load_avg': psutil.getloadavg(),
            'timestamp': timezone.now().isoformat()
        }
    def collect_database_metrics(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM pg_stat_activity;")
            active_connections = cursor.fetchone()[0]
            cursor.execute("SELECT pg_database_size(current_database());")
            db_size = cursor.fetchone()[0]
        return {
            'active_connections': active_connections,
            'database_size_bytes': db_size,
            'database_size_gb': db_size / (1024**3),
            'timestamp': timezone.now().isoformat()
        }
    def collect_app_metrics(self, app_name):
        cache_key = f"metrics_{app_name}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        metrics = {
            'app_name': app_name,
            'timestamp': timezone.now().isoformat(),
            'error_rate': self._estimate_error_rate(app_name),
        }
        cache.set(cache_key, metrics, timeout=60)
        return metrics
    def _estimate_error_rate(self, app_name):
        from apps.configs.models import HealthCheck
        last_hour = timezone.now() - timedelta(hours=1)
        checks = HealthCheck.objects.filter(
            app__name=app_name,
            created_at__gte=last_hour
        )
        if checks.count() == 0:
            return 0
        unhealthy = checks.filter(status__in=['unhealthy', 'degraded']).count()
        return (unhealthy / checks.count()) * 100