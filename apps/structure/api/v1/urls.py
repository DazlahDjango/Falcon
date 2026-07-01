from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views.system_settings_views import (
    StructureSystemSettingsView,
    StructureSystemSettingsResetView,
)
from .views.reference_data import StructureReferenceDataView
from .views import (
    OrganizationalUnitViewSet,
    DivisionViewSet,
    DepartmentViewSet,
    DepartmentTreeViewSet,
    SectionViewSet,
    UnitViewSet,
    PositionViewSet,
    EmploymentViewSet,
    ReportingLineViewSet,
    InterimAssignmentViewSet,
    HierarchyViewSet,
    OrgChartViewSet,
    BulkOperationViewSet,
    CostCenterViewSet,
    LocationViewSet,
    StructureDashboardViewSet,
    StructureHealthViewSet,
)

# Main router
router = DefaultRouter()
router.register(r'organizational-units', OrganizationalUnitViewSet, basename='organizational-units')
router.register(r'divisions', DivisionViewSet, basename='divisions')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'department-trees', DepartmentTreeViewSet, basename='department-trees')
router.register(r'sections', SectionViewSet, basename='sections')
router.register(r'units', UnitViewSet, basename='units')
router.register(r'positions', PositionViewSet, basename='positions')
router.register(r'employments', EmploymentViewSet, basename='employments')
router.register(r'reporting-lines', ReportingLineViewSet, basename='reporting-lines')
router.register(r'interim-assignments', InterimAssignmentViewSet, basename='interim-assignments')
router.register(r'hierarchy', HierarchyViewSet, basename='hierarchy')
router.register(r'org-charts', OrgChartViewSet, basename='org-charts')
router.register(r'bulk-operations', BulkOperationViewSet, basename='bulk-operations')
router.register(r'cost-centers', CostCenterViewSet, basename='cost-centers')
router.register(r'locations', LocationViewSet, basename='locations')
router.register(r'dashboard', StructureDashboardViewSet, basename='structure-dashboard')
router.register(r'health', StructureHealthViewSet, basename='structure-health')

# Nested routers for hierarchical relationships
# Organizational Units - children
org_units_router = routers.NestedDefaultRouter(router, r'organizational-units', lookup='org_unit')
org_units_router.register(r'children', OrganizationalUnitViewSet, basename='org-unit-children')
org_units_router.register(r'employments', EmploymentViewSet, basename='org-unit-employments')

# Divisions - departments
divisions_router = routers.NestedDefaultRouter(router, r'divisions', lookup='division')
divisions_router.register(r'departments', DepartmentViewSet, basename='division-departments')
divisions_router.register(r'employments', EmploymentViewSet, basename='division-employments')

# Departments - sections
departments_router = routers.NestedDefaultRouter(router, r'departments', lookup='department')
departments_router.register(r'sections', SectionViewSet, basename='department-sections')
departments_router.register(r'employments', EmploymentViewSet, basename='department-employments')

# Sections - units
sections_router = routers.NestedDefaultRouter(router, r'sections', lookup='section')
sections_router.register(r'units', UnitViewSet, basename='section-units')
sections_router.register(r'employments', EmploymentViewSet, basename='section-employments')

# Units - employments
units_router = routers.NestedDefaultRouter(router, r'units', lookup='unit')
units_router.register(r'employments', EmploymentViewSet, basename='unit-employments')

# Positions - incumbents
positions_router = routers.NestedDefaultRouter(router, r'positions', lookup='position')
positions_router.register(r'incumbents', EmploymentViewSet, basename='position-incumbents')
positions_router.register(r'reports', PositionViewSet, basename='position-reports')

# Employments - reporting lines
employments_router = routers.NestedDefaultRouter(router, r'employments', lookup='employment')
employments_router.register(r'reporting-lines', ReportingLineViewSet, basename='employment-reporting')
employments_router.register(r'interim-assignments', InterimAssignmentViewSet, basename='employment-interim')

urlpatterns = [
    # System settings
    path('system-settings/', StructureSystemSettingsView.as_view(), name='structure-system-settings'),
    path('system-settings/reset/', StructureSystemSettingsResetView.as_view(), name='structure-system-settings-reset'),
    
    # Reference data
    path('reference-data/', StructureReferenceDataView.as_view(), name='structure-reference-data'),
    
    # Main router URLs
    path('', include(router.urls)),
    
    # Nested router URLs
    path('', include(org_units_router.urls)),
    path('', include(divisions_router.urls)),
    path('', include(departments_router.urls)),
    path('', include(sections_router.urls)),
    path('', include(units_router.urls)),
    path('', include(positions_router.urls)),
    path('', include(employments_router.urls)),
    
    # Custom endpoints
    path('me/', EmploymentViewSet.as_view({'get': 'get_current_employments'}), name='my-employment'),
    path('my-chain/', ReportingLineViewSet.as_view({'get': 'get_reporting_chain'}), name='my-chain'),
    path('my-team/', ReportingLineViewSet.as_view({'get': 'get_team_members'}), name='my-team'),
    path('search/', OrganizationalUnitViewSet.as_view({'get': 'list'}), name='structure-search'),
]

app_name = 'structure'