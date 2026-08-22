# apps/reportplt/tests/test_views.py
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from apps.reportplt.api.v1.serializers import (
    ReportListSerializer, ReportDetailSerializer, ReportGenerateSerializer,
    ReportExportSerializer, DashboardListSerializer, TemplateListSerializer,
    ScheduleListSerializer, AuditListSerializer, TrendAnalysisSerializer
)
from apps.reportplt.api.v1.views import (
    ReportingViewSet, ReportViewSet, DashboardViewSet,
    TemplateViewSet, ScheduleViewSet, AnalyticsViewSet
)
from apps.reportplt.services.dtos import ReportPayloadDTO, ExportResultDTO

class APIV1SerializersTestCase(TestCase):
    def test_report_generate_serializer_valid(self):
        data = {'report_id': 'kpi_performance', 'params': {'limit': 10}, 'async_mode': False}
        serializer = ReportGenerateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['report_id'], 'kpi_performance')

    def test_report_export_serializer_valid(self):
        data = {'report_id': 'kpi_performance', 'format': 'pdf', 'params': {}}
        serializer = ReportExportSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['format'], 'pdf')

    def test_trend_analysis_serializer_valid(self):
        data = {'report_id': '00000000-0000-0000-0000-000000000000', 'metric': 'sales', 'period': 'monthly'}
        serializer = TrendAnalysisSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
