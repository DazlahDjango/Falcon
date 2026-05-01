from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    DepartmentViewSet, DepartmentTreeViewSet,
    TeamViewSet, TeamHierarchyViewSet,
    PositionViewSet,
    EmploymentViewSet,
    ReportingLineViewSet,
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
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'department-trees', DepartmentTreeViewSet, basename='department-trees')
router.register(r'teams', TeamViewSet, basename='teams')
router.register(r'team-hierarchies', TeamHierarchyViewSet, basename='team-hierarchies')
router.register(r'positions', PositionViewSet, basename='positions')
router.register(r'employments', EmploymentViewSet, basename='employments')
router.register(r'reporting-lines', ReportingLineViewSet, basename='reporting-lines')
router.register(r'hierarchy', HierarchyViewSet, basename='hierarchy')
router.register(r'org-charts', OrgChartViewSet, basename='org-charts')
router.register(r'bulk-operations', BulkOperationViewSet, basename='bulk-operations')
router.register(r'cost-centers', CostCenterViewSet, basename='cost-centers')
router.register(r'locations', LocationViewSet, basename='locations')
router.register(r'dashboard', StructureDashboardViewSet, basename='structure-dashboard')
router.register(r'health', StructureHealthViewSet, basename='structure-health')

# Nested routers for hierarchical relationships
# Departments
departments_router = routers.NestedDefaultRouter(router, r'departments', lookup='department')
departments_router.register(r'teams', TeamViewSet, basename='department-teams')
departments_router.register(r'children', DepartmentViewSet, basename='department-children')
departments_router.register(r'employments', EmploymentViewSet, basename='department-employments')
# Team
teams_router = routers.NestedDefaultRouter(router, r'teams', lookup='team')
teams_router.register(r'members', EmploymentViewSet, basename='team-members')
teams_router.register(r'sub-teams', TeamViewSet, basename='team-subteams')
# Position
positions_router = routers.NestedDefaultRouter(router, r'positions', lookup='position')
positions_router.register(r'incumbents', EmploymentViewSet, basename='position-incumbents')
positions_router.register(r'reports', PositionViewSet, basename='position-reports')
# Employment
employments_router = routers.NestedDefaultRouter(router, r'employments', lookup='employment')
employments_router.register(r'reporting-lines', ReportingLineViewSet, basename='employment-reporting')
urlpatterns = [
    # Main router URLs
    path('', include(router.urls)),
    # Nested router URLs
    path('', include(departments_router.urls)),
    path('', include(teams_router.urls)),
    path('', include(positions_router.urls)),
    path('', include(employments_router.urls)),
    # Additional custom endpoints
    path('me/', EmploymentViewSet.as_view({'get': 'get_current_employment'}), name='my-employment'),
    path('my-team/', ReportingLineViewSet.as_view({'get': 'get_team_members'}), name='my-team'),
    path('my-chain/', ReportingLineViewSet.as_view({'get': 'get_reporting_chain'}), name='my-chain'),
    path('search/', DepartmentViewSet.as_view({'get': 'search'}), name='structure-search'),
]
app_name = 'structure'
urlpatterns = urlpatterns