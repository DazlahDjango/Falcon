from django.urls import path, include

# API v1 endpoints
v1_patterns = [
    path('accounts/', include('apps.accounts.urls')),
    path('tenant/', include('apps.tenant.api.v1.urls')),
    path('structure/', include('apps.structure.urls')),
    path('kpis/', include('apps.kpi.urls')),
    path('billing/', include('apps.billing.api.v1.urls')),
    path('health/', include('health_check.urls')),
]

# API v2 endpoints (reserved for future ML/AI features)
v2_patterns = [
    # Future ML/AI endpoints will be added here
    # path('predictions/', include('apps.ml.urls')),
    # path('analytics/', include('apps.analytics.urls')),
]

# Versioned API patterns
urlpatterns = [
    path('v1/', include(v1_patterns)),
    path('v2/', include(v2_patterns)),
]