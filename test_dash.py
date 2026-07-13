import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from apps.structure.api.v1.views.dashboard_views import StructureDashboardViewSet
from django.test import RequestFactory
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.exclude(tenant_id__isnull=True).first()
request = RequestFactory().get('/api/v1/structure/dashboard/overview/')
request.user = user
view = StructureDashboardViewSet.as_view({'get': 'get_overview'})
try:
    response = view(request)
    print('OVERVIEW CODE:', response.status_code)
except Exception as e:
    import traceback
    traceback.print_exc()

view2 = StructureDashboardViewSet.as_view({'get': 'get_hierarchy_health'})
request2 = RequestFactory().get('/api/v1/structure/dashboard/hierarchy-health/')
request2.user = user
try:
    response2 = view2(request2)
    print('HEALTH CODE:', response2.status_code)
except Exception as e:
    import traceback
    traceback.print_exc()
