from django.urls import path, include
from .api.v1 import urls as v1_urls
app_name = 'kpi'

urlpatterns = [
    path('', include(v1_urls)),
]