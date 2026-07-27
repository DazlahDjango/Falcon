import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from apps.structure.api.v1.views.hierarchy_views import HierarchyViewSet
from django.test import RequestFactory
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.exclude(tenant_id__isnull=True).first()
request = RequestFactory().get('/api/v1/structure/hierarchy/current/')
request.user = user
view = HierarchyViewSet.as_view({'get': 'get_current_version'})
try:
    response = view(request)
    print('CURRENT CODE:', response.status_code)
except Exception as e:
    print('CURRENT FAILED')
    import traceback
    traceback.print_exc()

request2 = RequestFactory().get('/api/v1/structure/hierarchy/')
request2.user = user
view2 = HierarchyViewSet.as_view({'get': 'list'})
try:
    response2 = view2(request2)
    print('HISTORY CODE:', response2.status_code)
except Exception as e:
    print('HISTORY FAILED')
    import traceback
    traceback.print_exc()

request3 = RequestFactory().get('/api/v1/structure/hierarchy/validate/')
request3.user = user
view3 = HierarchyViewSet.as_view({'get': 'validate_hierarchy'})
try:
    response3 = view3(request3)
    print('VALIDATE CODE:', response3.status_code)
except Exception as e:
    print('VALIDATE FAILED')
    import traceback
    traceback.print_exc()
