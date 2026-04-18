from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .views import (
    SectorViewSet, KPIFrameworkViewSet, KPICategoryViewSet, KPITemplateViewSet,
    KPIViewSet, KPIWeightViewSet, StrategicLinkageViewSet, KPIDependencyViewSet,
    AnnualTargetViewSet, MonthlyPhasingViewSet,
    MonthlyActualViewSet, EvidenceViewSet, ActualAdjustmentViewSet,
    ValidationRecordViewSet, RejectionReasonViewSet, EscalationViewSet,
    ScoreViewSet, AggregatedScoreViewSet, TrafficLightViewSet,
    CascadeMapViewSet, CascadeRuleViewSet,
    IndividualDashboardView, ManagerDashboardView, ExecutiveDashboardView, ChampionDashboardView,
    KPISummaryViewSet, DepartmentRollupViewSet, OrganizationHealthViewSet,
    BulkKPIUploadView, BulkActualUploadView, BulkTargetUploadView,
    TriggerCalculationView, CalculationStatusView,
    KPIHistoryViewSet, ActualHistoryViewSet, TargetHistoryViewSet
)
from .views.user_nested import UserKPIsViewSet, UserTargetsViewSet, UserScoresViewSet, UserActualsViewSet, UserViewSet
from .views.export import KPIExportView, ScoreExportView, ReportExportView
from .views.insight import AnalyticsInsightsView, RiskPredictionsView

# Main router configuration
# =========================
router = DefaultRouter()
router.trailing_slash = '/?'
# Framework
router.register(r'sectors', SectorViewSet, basename='sector')
router.register(r'frameworks', KPIFrameworkViewSet, basename='framework')
router.register(r'categories', KPICategoryViewSet, basename='category')
router.register(r'templates', KPITemplateViewSet, basename='template')
router.register(r'users', UserViewSet, basename='user')
# KPI endpoints
router.register(r'kpis', KPIViewSet, basename='kpi')
router.register(r'kpi-weights', KPIWeightViewSet, basename='kpi-weight')
router.register(r'strategic-linkages', StrategicLinkageViewSet, basename='strategic-linkage')
router.register(r'kpi-dependencies', KPIDependencyViewSet, basename='kpi-dependency')
# Target endpoints
router.register(r'targets', AnnualTargetViewSet, basename='target')
router.register(r'monthly-phasing', MonthlyPhasingViewSet, basename='monthly-phasing')
# Actual endpoints
router.register(r'actuals', MonthlyActualViewSet, basename='actual')
router.register(r'evidence', EvidenceViewSet, basename='evidence')
router.register(r'actual-adjustments', ActualAdjustmentViewSet, basename='actual-adjustment')
# Validation endpoints
router.register(r'validations', ValidationRecordViewSet, basename='validation')
router.register(r'rejection-reasons', RejectionReasonViewSet, basename='rejection-reason')
router.register(r'escalations', EscalationViewSet, basename='escalation')
# Score endpoints
router.register(r'Scores', ScoreViewSet, basename='score')
router.register(r'aggregated-scores', AggregatedScoreViewSet, basename='aggregated-score')
router.register(r'traffic-lights', TrafficLightViewSet, basename='traffic-light')
# Cascade endpoints
router.register(r'cascade-maps', CascadeMapViewSet, basename='cascade-map')
router.register(r'cascade-rules', CascadeRuleViewSet, basename='cascade-rule')
# Analytics endpoints (ReadOnly)
router.register(r'kpi-summaries', KPISummaryViewSet, basename='kpi-summary')
router.register(r'department-rollups', DepartmentRollupViewSet, basename='department-rollup')
router.register(r'organization-health', OrganizationHealthViewSet, basename='organization-health')
# History endpoints (Audit)
router.register(r'kpi-history', KPIHistoryViewSet, basename='kpi-history')
router.register(r'actual-history', ActualHistoryViewSet, basename='actual-history')
router.register(r'target-history', TargetHistoryViewSet, basename='target-history')

# Nested Routers
# ===============
# KPI nested resources
kpi_router = routers.NestedDefaultRouter(router, r'kpis', lookup='kpi')
kpi_router.register(r'weights', KPIWeightViewSet, basename='kpi-weights')
kpi_router.register(r'strategic-linkages', StrategicLinkageViewSet, basename='kpi-strategic-linkage')
kpi_router.register(r'dependencies', KPIDependencyViewSet, basename='kpi-dependecies')
kpi_router.register(r'targets', AnnualTargetViewSet, basename='kpi-targets')
kpi_router.register(r'actuals', MonthlyActualViewSet, basename='kpi-actuals')
kpi_router.register(r'scores', ScoreViewSet, basename='kpi-scores')
# Target nested resources
target_router = routers.NestedDefaultRouter(router, r'targets', lookup='target')
target_router.register(r'phasing', MonthlyPhasingViewSet, basename='target-phasing')
target_router.register(r'history', TargetHistoryViewSet, basename='target-history')
# Actual nested resources
actual_router = routers.NestedDefaultRouter(router, r'actuals', lookup='actual')
actual_router.register(r'evidence', EvidenceViewSet, basename='actual-evidence')
actual_router.register(r'validations', ValidationRecordViewSet, basename='actual-validations')
actual_router.register(r'history', ActualHistoryViewSet, basename='actual-history')
# Framework nested resources
framework_router = routers.NestedDefaultRouter(router, r'frameworks', lookup='framework')
framework_router.register(r'categories', KPICategoryViewSet, basename='framework-categories')
framework_router.register(r'kpis', KPIViewSet, basename='framework-kpis')
# Sector nested resources
sector_router = routers.NestedDefaultRouter(router, r'sectors', lookup='sector')
sector_router.register(r'frameworks', KPIFrameworkViewSet, basename='sector-frameworks')
sector_router.register(r'templates', KPITemplateViewSet, basename='sector-templates')
# Category nested resources
category_router = routers.NestedDefaultRouter(router, r'categories', lookup='category')
category_router.register(r'children', KPICategoryViewSet, basename='category-children')
category_router.register(r'kpis', KPIViewSet, basename='category-kpis')
# User nested resources
user_router = routers.NestedDefaultRouter(router, r'users', lookup='user')
user_router.register(r'kpis', UserKPIsViewSet, basename='user-kpis')
user_router.register(r'targets', UserTargetsViewSet, basename='user-targets')
user_router.register(r'scores', UserScoresViewSet, basename='user-scores')
user_router.register(r'actuals', UserActualsViewSet, basename='user-actuals')

# Url patterns
# ============
urlpatterns = [
    # Main API endpoints
    path('', include(router.urls)),
    path('', include(kpi_router.urls)),
    path('', include(target_router.urls)),
    path('', include(actual_router.urls)),
    path('', include(framework_router.urls)),
    path('', include(sector_router.urls)),
    path('', include(category_router.urls)),
    path('', include(user_router.urls)),
    # Dashboard endpoints
    path('dashboard/individual/', IndividualDashboardView.as_view(), name='dashboard-individual'),
    path('dashboard/manager/', ManagerDashboardView.as_view(), name='dashboard-manager'),
    path('dashboard/executive/', ExecutiveDashboardView.as_view(), name='dashboard-executive'),
    path('dashboard/champion/', ChampionDashboardView.as_view(), name='dashboard-champion'),
    # Bulk operations
    path('bulk/kpi-upload/', BulkKPIUploadView.as_view(), name='bulk-kpi-upload'),
    path('bulk/actual-upload/', BulkActualUploadView.as_view(), name='bulk-actual-upload'),
    path('bulk/target-upload/', BulkTargetUploadView.as_view(), name='bulk-target-upload'),
    # Calculation triggers
    path('calculations/trigger/', TriggerCalculationView.as_view(), name='trigger-calculation'),
    path('calculations/status/<str:task_id>/', CalculationStatusView.as_view(), name='calculation-status'),
    # Export endpoints
    path('export/kpis/', KPIExportView.as_view(), name='export-kpis'),
    path('export/scores/', ScoreExportView.as_view(), name='export-scores'),
    path('export/reports/', ReportExportView.as_view(), name='export-reports'),
    # Anaytics endpoints
    path('analytics/insights/', AnalyticsInsightsView.as_view(), name='analytics-insights'),
    path('analytics/predictions/', RiskPredictionsView.as_view(), name='risk-predictions'),
]

# API Root View
# ===============
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'name': 'KPI Management API',
        'version': '1.0.0',
        'description': 'REST API for KPI tracking, performance management, and analytics',
        'endpoints': {
            'frameworks': reverse('framework-list', request=request, format=format),
            'kpis': reverse('kpi-list', request=request, format=format),
            'targets': reverse('target-list', request=request, format=format),
            'actuals': reverse('actual-list', request=request, format=format),
            'scores': reverse('score-list', request=request, format=format),
            'dashboards': {
                'individual': reverse('dashboard-individual', request=request, format=format),
                'manager': reverse('dashboard-manager', request=request, format=format),
                'executive': reverse('dashboard-executive', request=request, format=format),
                'champion': reverse('dashboard-champion', request=request, format=format),
            },
            'analytics': {
                'kpi_summaries': reverse('kpi-summary-list', request=request, format=format),
                'department_rollups': reverse('department-rollup-list', request=request, format=format),
                'organization_health': reverse('organization-health-list', request=request, format=format),
            },
            'bulk_operations': {
                'kpi_upload': reverse('bulk-kpi-upload', request=request, format=format),
                'actual_upload': reverse('bulk-actual-upload', request=request, format=format),
                'target_upload': reverse('bulk-target-upload', request=request, format=format),
            },
            'calculations': reverse('trigger-calculation', request=request, format=format),
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
] + urlpatterns