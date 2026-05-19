# apps/configs/services/health/metric_collector.py
import platform
import psutil
from django.utils import timezone
from django.db import models
from django.db import connection
from django.core.cache import cache
from datetime import timedelta

class MetricCollector:
    def collect_system_metrics(self):
        metrics = {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'timestamp': timezone.now().isoformat()
        }
        
        # Handle load average - Windows doesn't support this
        if platform.system() != 'Windows':
            try:
                metrics['load_avg'] = psutil.getloadavg()
            except Exception:
                metrics['load_avg'] = [0, 0, 0]
        else:
            # Windows alternative: use CPU percent as approximate load
            metrics['load_avg'] = [metrics['cpu_percent'], metrics['cpu_percent'], metrics['cpu_percent']]
        
        return metrics

    def collect_database_metrics(self):
        try:
            with connection.cursor() as cursor:
                # Get active connections count
                cursor.execute("SELECT count(*) FROM pg_stat_activity;")
                active_connections = cursor.fetchone()[0]
                
                # Get database size
                cursor.execute("SELECT pg_database_size(current_database());")
                db_size = cursor.fetchone()[0]
                
                # Get database name
                cursor.execute("SELECT current_database();")
                db_name = cursor.fetchone()[0]
                
                # Get connection count by state
                cursor.execute("""
                    SELECT state, count(*) 
                    FROM pg_stat_activity 
                    GROUP BY state;
                """)
                connections_by_state = dict(cursor.fetchall())
                
                return {
                    'active_connections': active_connections,
                    'database_size_bytes': db_size,
                    'database_size_gb': round(db_size / (1024**3), 2),
                    'database_name': db_name,
                    'connections_by_state': connections_by_state,
                    'timestamp': timezone.now().isoformat()
                }
        except Exception as e:
            return {
                'error': str(e),
                'active_connections': 0,
                'database_size_bytes': 0,
                'database_size_gb': 0,
                'database_name': 'unknown',
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
            'response_time_avg': self._get_avg_response_time(app_name),
            'request_count': self._get_request_count(app_name)
        }
        
        cache.set(cache_key, metrics, timeout=60)
        return metrics

    def _estimate_error_rate(self, app_name):
        from apps.configs.models import HealthCheck
        last_hour = timezone.now() - timedelta(hours=1)
        try:
            checks = HealthCheck.objects.filter(
                app__name=app_name,
                created_at__gte=last_hour
            )
            if checks.count() == 0:
                return 0
            unhealthy = checks.filter(status__in=['unhealthy', 'degraded']).count()
            return round((unhealthy / checks.count()) * 100, 2)
        except Exception:
            return 0

    def _get_avg_response_time(self, app_name):
        from apps.configs.models import HealthCheck
        last_day = timezone.now() - timedelta(days=1)
        try:
            checks = HealthCheck.objects.filter(
                app__name=app_name,
                created_at__gte=last_day,
                response_time_ms__isnull=False
            )
            if checks.count() == 0:
                return 0
            avg = checks.aggregate(avg=models.Avg('response_time_ms'))['avg']
            return round(avg or 0, 2)
        except Exception:
            return 0

    def _get_request_count(self, app_name):
        from apps.configs.models import HealthCheck
        last_hour = timezone.now() - timedelta(hours=1)
        try:
            return HealthCheck.objects.filter(
                app__name=app_name,
                created_at__gte=last_hour
            ).count()
        except Exception:
            return 0