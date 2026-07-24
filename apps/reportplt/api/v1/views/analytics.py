from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.reportplt.api.v1.serializers import (
    TrendAnalysisSerializer, PerformanceAnalysisSerializer,
    ComparativeAnalysisSerializer, PredictiveAnalysisSerializer,
    AnomalyDetectionSerializer
)
from apps.reportplt.api.v1.permissions import (
    AnalyticsViewPermission, TrendAnalysisPermission,
    ComparativeAnalysisPermission, PredictiveAnalysisPermission
)
from apps.reportplt.api.v1.throttles import (
    TrendAnalysisThrottle, PredictiveAnalysisThrottle,
    ComparativeAnalysisThrottle, AnomalyDetectionThrottle
)
from apps.reportplt.api.v1.decorators import audit_log
from apps.reportplt.services.analytics.trend_analyzer import TrendAnalyzer
from apps.reportplt.services.analytics.performance_analyzer import PerformanceAnalyzer
from apps.reportplt.services.analytics.comparative_analyzer import ComparativeAnalyzer
from apps.reportplt.services.analytics.predictive_analyzer import PredictiveAnalyzer
from apps.reportplt.services.analytics.anomaly_detector import AnomalyDetector
from apps.reportplt.services.generation.report_generator import ReportGenerator
from apps.reportplt.constants import AuditAction
from rest_framework.permissions import IsAuthenticated
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from .base import BaseViewSet

class AnalyticsViewSet(BaseViewSet):
    permission_classes = [IsAuthenticated, TenantIsolationPermission, AnalyticsViewPermission]

    def get_permissions(self):
        if self.action == 'trend':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, TrendAnalysisPermission]
        elif self.action == 'comparative':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, ComparativeAnalysisPermission]
        elif self.action == 'predictive':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, PredictiveAnalysisPermission]
        elif self.action == 'anomaly':
            permission_classes = [IsAuthenticated, TenantIsolationPermission, AnalyticsViewPermission]
        else:
            permission_classes = [IsAuthenticated, TenantIsolationPermission, AnalyticsViewPermission]
        return [permission() for permission in permission_classes]

    def get_throttles(self):
        if self.action == 'trend':
            return [TrendAnalysisThrottle()]
        elif self.action == 'predictive':
            return [PredictiveAnalysisThrottle()]
        elif self.action == 'comparative':
            return [ComparativeAnalysisThrottle()]
        elif self.action == 'anomaly':
            return [AnomalyDetectionThrottle()]
        return super().get_throttles()

    @action(detail=False, methods=['post'], url_path='trend')
    @audit_log(action=AuditAction.VIEW)
    def trend(self, request):
        serializer = TrendAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data['report_id']
        generator = ReportGenerator(request.user)
        result = generator.generate_report(str(report_id), serializer.validated_data.get('params', {}))
        if result.get('status') != 'success':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = result.get('data', {})
        kpis = data.get('kpis', [])
        analyzer = TrendAnalyzer()
        trend_result = analyzer.analyze_trends(
            kpis,
            date_field='period',
            value_field='progress'
        )
        return Response({
            'status': 'success',
            'report_id': report_id,
            'data': trend_result,
            'generated_at': timezone.now().isoformat()
        })

    @action(detail=False, methods=['post'], url_path='performance')
    @audit_log(action=AuditAction.VIEW)
    def performance(self, request):
        serializer = PerformanceAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data['report_id']
        generator = ReportGenerator(request.user)
        result = generator.generate_report(str(report_id), serializer.validated_data.get('params', {}))
        if result.get('status') != 'success':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = result.get('data', {})
        kpis = data.get('kpis', [])
        analyzer = PerformanceAnalyzer()
        performance_result = analyzer.analyze_performance(
            kpis,
            target_field='target',
            actual_field='actual',
            name_field='name'
        )
        return Response({
            'status': 'success',
            'report_id': report_id,
            'data': performance_result,
            'generated_at': timezone.now().isoformat()
        })

    @action(detail=False, methods=['post'], url_path='comparative')
    @audit_log(action=AuditAction.VIEW)
    def comparative(self, request):
        serializer = ComparativeAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data['report_id']
        generator = ReportGenerator(request.user)
        result = generator.generate_report(str(report_id), serializer.validated_data.get('params', {}))
        if result.get('status') != 'success':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = result.get('data', {})
        kpis = data.get('kpis', [])
        compare_type = serializer.validated_data['compare_type']
        compare_ids = serializer.validated_data['compare_ids']
        analyzer = ComparativeAnalyzer()
        grouped_data = {}
        for kpi in kpis:
            key = kpi.get(compare_type, 'Unknown')
            if key in compare_ids or not compare_ids:
                if key not in grouped_data:
                    grouped_data[key] = []
                grouped_data[key].append(kpi)
        if compare_type == 'department':
            comparative_result = analyzer.compare_departments(grouped_data)
        elif compare_type == 'team':
            comparative_result = analyzer.compare_teams(grouped_data)
        else:
            comparative_result = analyzer.compare_categories(grouped_data)
        return Response({
            'status': 'success',
            'report_id': report_id,
            'data': comparative_result,
            'generated_at': timezone.now().isoformat()
        })

    @action(detail=False, methods=['post'], url_path='predictive')
    @audit_log(action=AuditAction.VIEW)
    def predictive(self, request):
        serializer = PredictiveAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data['report_id']
        generator = ReportGenerator(request.user)
        result = generator.generate_report(str(report_id), serializer.validated_data.get('params', {}))
        if result.get('status') != 'success':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = result.get('data', {})
        kpis = data.get('kpis', [])
        values = [k.get('progress', 0) for k in kpis if k.get('progress') is not None]
        analyzer = PredictiveAnalyzer()
        method = serializer.validated_data.get('prediction_type', 'linear')
        periods_ahead = serializer.validated_data.get('periods_ahead', 3)
        confidence = serializer.validated_data.get('confidence', 0.95)
        forecast_result = analyzer.get_forecast_summary(
            values,
            periods=periods_ahead,
            method=method
        )
        return Response({
            'status': 'success',
            'report_id': report_id,
            'data': forecast_result,
            'generated_at': timezone.now().isoformat()
        })

    @action(detail=False, methods=['post'], url_path='anomaly')
    @audit_log(action=AuditAction.VIEW)
    def anomaly(self, request):
        serializer = AnomalyDetectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report_id = serializer.validated_data['report_id']
        generator = ReportGenerator(request.user)
        result = generator.generate_report(str(report_id), serializer.validated_data.get('params', {}))
        if result.get('status') != 'success':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        data = result.get('data', {})
        kpis = data.get('kpis', [])
        values = [k.get('progress', 0) for k in kpis if k.get('progress') is not None]
        detector = AnomalyDetector(
            window_size=serializer.validated_data.get('window_size', 30),
            threshold=serializer.validated_data.get('threshold', 2.0)
        )
        detection_type = serializer.validated_data.get('detection_type', 'zscore')
        if detection_type == 'zscore':
            anomalies = detector.detect_anomalies(values)
        elif detection_type == 'iqr':
            anomalies = detector.detect_outliers_iqr(values)
        elif detection_type == 'trend':
            anomalies = detector.detect_trend_anomalies(values)
        elif detection_type == 'sudden_change':
            anomalies = detector.detect_sudden_changes(values)
        else:
            anomalies = detector.detect_anomalies(values)
        return Response({
            'status': 'success',
            'report_id': report_id,
            'data': {
                'anomalies': anomalies,
                'summary': detector.get_anomaly_summary(values)
            },
            'generated_at': timezone.now().isoformat()
        })