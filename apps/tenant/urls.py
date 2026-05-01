from django.urls import path, include
from api.v1.views import *

app_name = 'tenant'

urlpatterns = [
    # REST API endpoints for tenant management
    path('api/v1/', include('apps.tenant.api.v1.urls')),
]
