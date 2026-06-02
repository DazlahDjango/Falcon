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
    KPIHistoryViewSet, ActualHistoryViewSet, TargetHistoryViewSet, PerformanceHeatmapView, 
    AnalyticsExportView, CustomReportView, NotificationPreferencesView,
    KPIOverviewDashboardView
)
from .views.user_nested import UserKPIsViewSet, UserTargetsViewSet, UserScoresViewSet, UserActualsViewSet, UserViewSet
from .views.export import KPIExportView, ScoreExportView, ReportExportView
from .views.insight import AnalyticsInsightsView, RiskPredictionsView
from .views.system_settings_views import KpiSystemSettingsView, KpiSystemSettingsResetView
from .views.reference_data import KpiReferenceDataView

# Main router configuration
router = DefaultRouter()
router.trailing_slash = '/?'

# Framework & Management (Admin CRUD)
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
router.register(r'scores', ScoreViewSet, basename='score')
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
kpi_router = routers.NestedDefaultRouter(router, r'kpis', lookup='kpi')
kpi_router.register(r'weights', KPIWeightViewSet, basename='kpi-weights')
kpi_router.register(r'strategic-linkages', StrategicLinkageViewSet, basename='kpi-strategic-linkage')
kpi_router.register(r'dependencies', KPIDependencyViewSet, basename='kpi-dependencies')
kpi_router.register(r'targets', AnnualTargetViewSet, basename='kpi-targets')
kpi_router.register(r'actuals', MonthlyActualViewSet, basename='kpi-actuals')
kpi_router.register(r'scores', ScoreViewSet, basename='kpi-scores')

target_router = routers.NestedDefaultRouter(router, r'targets', lookup='target')
target_router.register(r'phasing', MonthlyPhasingViewSet, basename='target-phasing')
target_router.register(r'history', TargetHistoryViewSet, basename='target-history')

actual_router = routers.NestedDefaultRouter(router, r'actuals', lookup='actual')
actual_router.register(r'evidence', EvidenceViewSet, basename='actual-evidence')
actual_router.register(r'validations', ValidationRecordViewSet, basename='actual-validations')
actual_router.register(r'history', ActualHistoryViewSet, basename='actual-history')

framework_router = routers.NestedDefaultRouter(router, r'frameworks', lookup='framework')
framework_router.register(r'categories', KPICategoryViewSet, basename='framework-categories')
framework_router.register(r'kpis', KPIViewSet, basename='framework-kpis')

sector_router = routers.NestedDefaultRouter(router, r'sectors', lookup='sector')
sector_router.register(r'frameworks', KPIFrameworkViewSet, basename='sector-frameworks')
sector_router.register(r'templates', KPITemplateViewSet, basename='sector-templates')

category_router = routers.NestedDefaultRouter(router, r'categories', lookup='category')
category_router.register(r'children', KPICategoryViewSet, basename='category-children')
category_router.register(r'kpis', KPIViewSet, basename='category-kpis')

user_router = routers.NestedDefaultRouter(router, r'users', lookup='user')
user_router.register(r'kpis', UserKPIsViewSet, basename='user-kpis')
user_router.register(r'targets', UserTargetsViewSet, basename='user-targets')
user_router.register(r'scores', UserScoresViewSet, basename='user-scores')
user_router.register(r'actuals', UserActualsViewSet, basename='user-actuals')

# ============================================================
# URL PATTERNS
# ============================================================
urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    path('', include(kpi_router.urls)),
    path('', include(target_router.urls)),
    path('', include(actual_router.urls)),
    path('', include(framework_router.urls)),
    path('', include(sector_router.urls)),
    path('', include(category_router.urls)),
    path('', include(user_router.urls)),
    
    # ============================================================
    # DASHBOARD ENDPOINTS
    # ============================================================
    path('dashboard/individual/', IndividualDashboardView.as_view(), name='dashboard-individual'),
    path('dashboard/manager/', ManagerDashboardView.as_view(), name='dashboard-manager'),
    path('dashboard/executive/', ExecutiveDashboardView.as_view(), name='dashboard-executive'),
    path('dashboard/champion/', ChampionDashboardView.as_view(), name='dashboard-champion'),
    
    # ============================================================
    # ADMIN OVERVIEW DASHBOARD (NEW)
    # ============================================================
    path('admin/overview/', KPIOverviewDashboardView.as_view(), name='kpi-admin-overview'),
    
    # ============================================================
    # BULK OPERATIONS
    # ============================================================
    path('bulk/kpi-upload/', BulkKPIUploadView.as_view(), name='bulk-kpi-upload'),
    path('bulk/actual-upload/', BulkActualUploadView.as_view(), name='bulk-actual-upload'),
    path('bulk/target-upload/', BulkTargetUploadView.as_view(), name='bulk-target-upload'),
    
    # ============================================================
    # CALCULATION TRIGGERS
    # ============================================================
    path('calculations/trigger/', TriggerCalculationView.as_view(), name='trigger-calculation'),
    path('calculations/status/<str:task_id>/', CalculationStatusView.as_view(), name='calculation-status'),
    
    # ============================================================
    # EXPORT ENDPOINTS
    # ============================================================
    path('export/kpis/', KPIExportView.as_view(), name='export-kpis'),
    path('export/scores/', ScoreExportView.as_view(), name='export-scores'),
    path('export/reports/', ReportExportView.as_view(), name='export-reports'),
    
    # ============================================================
    # ANALYTICS ENDPOINTS
    # ============================================================
    path('analytics/insights/', AnalyticsInsightsView.as_view(), name='analytics-insights'),
    path('analytics/predictions/', RiskPredictionsView.as_view(), name='risk-predictions'),
    path('analytics/export/', AnalyticsExportView.as_view(), name='analytics-export'),
    path('analytics/heatmap/', PerformanceHeatmapView.as_view(), name='analytics-heatmap'),
    
    # ============================================================
    # REPORTING ENDPOINTS
    # ============================================================
    path('reports/custom/', CustomReportView.as_view(), name='custom-report'),
    
    # ============================================================
    # SYSTEM CONFIGURATION
    # ============================================================
    path('reference-data/', KpiReferenceDataView.as_view(), name='kpi-reference-data'),
    path('system-settings/', KpiSystemSettingsView.as_view(), name='kpi-system-settings'),
    path('system-settings/reset/', KpiSystemSettingsResetView.as_view(), name='kpi-system-settings-reset'),
    path('notifications/preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),
]

# API Root View
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'name': 'KPI Management API',
        'version': '1.0.0',
        'description': 'REST API for KPI tracking, performance management, and analytics',
        'endpoints': {
            # Framework Management
            'frameworks': {
                'list': reverse('framework-list', request=request, format=format),
                'create': reverse('framework-list', request=request, format=format),
                'publish': '/api/v1/kpis/frameworks/{id}/publish/',
                'archive': '/api/v1/kpis/frameworks/{id}/archive/',
                'duplicate': '/api/v1/kpis/frameworks/{id}/duplicate/',
            },
            'categories': {
                'list': reverse('category-list', request=request, format=format),
                'create': reverse('category-list', request=request, format=format),
                'move': '/api/v1/kpis/categories/{id}/move/',
                'reorder': '/api/v1/kpis/categories/reorder/',
            },
            'sectors': reverse('sector-list', request=request, format=format),
            'templates': reverse('template-list', request=request, format=format),
            
            # Core KPI
            'kpis': reverse('kpi-list', request=request, format=format),
            'targets': reverse('target-list', request=request, format=format),
            'actuals': reverse('actual-list', request=request, format=format),
            'scores': reverse('score-list', request=request, format=format),
            
            # Dashboards
            'dashboards': {
                'individual': reverse('dashboard-individual', request=request, format=format),
                'manager': reverse('dashboard-manager', request=request, format=format),
                'executive': reverse('dashboard-executive', request=request, format=format),
                'champion': reverse('dashboard-champion', request=request, format=format),
                'admin_overview': reverse('kpi-admin-overview', request=request, format=format),
            },
            
            # Analytics
            'analytics': {
                'kpi_summaries': reverse('kpi-summary-list', request=request, format=format),
                'department_rollups': reverse('department-rollup-list', request=request, format=format),
                'organization_health': reverse('organization-health-list', request=request, format=format),
                'insights': reverse('analytics-insights', request=request, format=format),
                'predictions': reverse('risk-predictions', request=request, format=format),
                'heatmap': reverse('analytics-heatmap', request=request, format=format),
            },
            
            # Bulk Operations
            'bulk_operations': {
                'kpi_upload': reverse('bulk-kpi-upload', request=request, format=format),
                'actual_upload': reverse('bulk-actual-upload', request=request, format=format),
                'target_upload': reverse('bulk-target-upload', request=request, format=format),
            },
            
            # Calculations
            'calculations': reverse('trigger-calculation', request=request, format=format),
            
            # Exports
            'exports': {
                'kpis': reverse('export-kpis', request=request, format=format),
                'scores': reverse('export-scores', request=request, format=format),
                'reports': reverse('export-reports', request=request, format=format),
            },
            
            # System
            'system_settings': reverse('kpi-system-settings', request=request, format=format),
            'reference_data': reverse('kpi-reference-data', request=request, format=format),
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
] + urlpatterns