# apps/reviews/apps.py
"""
App configuration for Reviews app
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ReviewsConfig(AppConfig):
    """
    Configuration class for the Reviews application.
    """
    
    # Django model field auto-creation setting
    default_auto_field = 'django.db.models.BigAutoField'
    
    # App namespace (used in Django admin and reverse URL lookups)
    name = 'apps.reviews'
    
    # App label (unique identifier, used in model references like 'reviews.ReviewCycle')
    label = 'reviews'
    
    # Human-readable name for the app
    verbose_name = _('Performance Reviews')
    
    def ready(self):
        """
        Called when the app registry is fully populated.
        Used to import signals and register system checks.
        """
        # Import signals to register them with Django's signal dispatcher
        import apps.reviews.signals
        import apps.reviews.signals_security
        import apps.reviews.signals_realtime

        self._warm_reviews_cache()
        
        try:
            from apps.configs.services.registry.app_registry import AppRegistry
            AppRegistry().register_from_definition('reviews')
        except ImportError:
            pass
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning('Failed to register reviews with config app: %s', e)
        
        # Register any system checks (optional)
        # from .checks import register_checks
        # register_checks()
        
    def _warm_reviews_cache(self):
        """Warm settings cache on startup (dashboard metrics via Celery warm_dashboard_cache)."""
        try:
            from django.db import connection
            if not connection.introspection.table_names():
                return
            from apps.reviews.services.settings import ReviewsSettingsService
            if 'reviews_system_settings' not in connection.introspection.table_names():
                return
            ReviewsSettingsService.get_settings(use_cache=True)
        except Exception as e:
            import logging
            logging.getLogger(__name__).debug('Reviews settings cache warm skipped: %s', e)