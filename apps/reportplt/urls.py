# apps/reportplt/urls.py
from django.urls import path, include

app_name = 'reportplt'

urlpatterns = [
    path('', include('apps.reportplt.api.v1.urls')),
]