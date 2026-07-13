import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from apps.structure.api.v1.views.hierarchy_views import HierarchyViewSet
from django.test import RequestFactory
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.exclude(tenant_id__isnull=True).first()
request = RequestFactory().get('/api/v1/structure/hierarchy/')
request.user = user
view = HierarchyViewSet.as_view({'get': 'list'})
try:
    response = view(request)
    print('HIERARCHY LIST CODE:', response.status_code)
except Exception as e:
    import traceback
    traceback.print_exc()
