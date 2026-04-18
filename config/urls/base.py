"""
URL configuration for Falcon Base URLs Project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from apps.core.views import health_check
import warnings

# API Docs
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title='Falcon Platform Management System',
        default_version='v1',
        description='Performance Management System API',
        terms_of_service='https://www.falcon.co.ke/terms/',
        contact=openapi.Contact(email="operations@falconigc.com"),
        license=openapi.License(name='Proprietary')
    ),
    public=True,
    permission_classes=[permissions.AllowAny]
)
from apps.core.views import home_view

urlpatterns = [
    path('', home_view, name='home'),
    path(settings.ADMIN_URL, admin.site.urls),  # Added trailing slash
    # Health
    path('health/', include('health_check.urls')),
    # path('api/v1/', include(('config.urls.api', 'v1'))),
    # API Docs
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui (cache_timeout=0), name='schema-json'),
    # API/V1 URLs patterns
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/organisations/', include('apps.organisations.api.v1.urls')),
    path('api/v1/kpi/', include('apps.kpi.urls')),
    path('api/v1/health/', health_check, name='api-health'),
]

# Debug toolbar in development
if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass
    
    # Serve static/media files in development
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# In production, warn if using default admin URL
if getattr(settings, 'DJANGO_ENV', 'development') == 'production' and settings.ADMIN_URL == 'admin/':
    warnings.warn(
        "Using default admin URL in production! "
        "Set ADMIN_URL in your .env file to a custom value (e.g., 'x7k9m2p4r8').",
        UserWarning
    )

# Error handlers 