from django.test import TestCase
from rest_framework.test import APIClient
from apps.reportplt.models import Report, ReportTemplate, ReportDashboard

class ReportPltSmokeTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_imports_and_models(self):
        # Simply ensure models can be imported and querysets created
        self.assertEqual(Report.objects.count(), 0)
        self.assertEqual(ReportTemplate.objects.count(), 0)
        self.assertEqual(ReportDashboard.objects.count(), 0)
