import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from apps.structure.api.v1.views.dashboard_views import StructureDashboardViewSet
from django.test import RequestFactory
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.exclude(tenant_id__isnull=True).first()
request = RequestFactory().get('/api/v1/structure/dashboard/trends/')
request.user = user
view = StructureDashboardViewSet.as_view({'get': 'get_trends'})
try:
    response = view(request)
    print('TRENDS CODE:', response.status_code)
except Exception as e:
    import traceback
    traceback.print_exc()
