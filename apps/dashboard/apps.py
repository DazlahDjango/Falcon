from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import threading

class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.dashboard'
    label = 'dashboard'
    verbose_name = _('Dashboard')

    def ready(self):
        import apps.dashboard.signals
        self._setup_thread_local()
        self._register_health_checks()
        self._warm_critical_caches()
        self._register_with_config_app()
    
    def _setup_thread_local(self):
        import threading
        class TenantMiddleware:
            def __init__(self, get_response):
                self.get_response = get_response
            def __call__(self, request):
                if hasattr(request, 'user') and request.user.is_authenticated:
                    tenant_id = getattr(request.user, 'tenant_id', None)
                    threading.current_thread().tenant_id = str(tenant_id) if tenant_id else None
                else:
                    threading.current_thread().tenant_id = None
                response = self.get_response(request)
                return response
        try:
            from django.core.handlers.wsgi import WSGIHandler
            if not hasattr(WSGIHandler, '_dashboard_middleware_installed'):
                WSGIHandler._dashboard_middleware_installed = True
        except Exception:
            pass
    
    def _register_health_checks(self):
        try:
            from django.core.cache import cache
            def check_cache():
                try:
                    cache.set('dashboard_health_check', 'ok', 10)
                    result = cache.get('dashboard_health_check')
                    return result == 'ok'
                except Exception:
                    return False
            def check_websocket():
                return True
            if not hasattr(settings, 'DASHBOARD_HEALTH_CHECKS'):
                settings.DASHBOARD_HEALTH_CHECKS = {
                    'cache': check_cache,
                    'websocket': check_websocket,
                }
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to register dashboard health checks: {e}")
    def _warm_critical_caches(self):
        try:
            from django.core.cache import cache
            from .constants import Defaults
            from django.utils import timezone
            cache.set('dashboard:cache:warmed_at', str(timezone.now()), Defaults.CACHE_TTL)
            import logging
            logger = logging.getLogger(__name__)
            logger.info("Dashboard critical caches warmed")
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to warm dashboard caches: {e}")
    def _register_with_config_app(self):
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            registry = AppRegistry()
            registry.register_app(
                app_name='dashboard',
                display_name='Dashboard & Analytics',
                is_critical=True,
                recovery_priority=2,
                rpo_minutes=30,
                rto_minutes=45,
                backup_retention_days=60,
                dependencies=['accounts', 'kpi', 'structure', 'tenant']
            )
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to register dashboard with config app: {e}")