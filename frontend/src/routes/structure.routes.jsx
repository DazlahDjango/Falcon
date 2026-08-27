import React from 'react';
import { Navigate } from 'react-router-dom';

// Fail-safe lazy load helper that handles both default and named exports
const lazyLoad = (importFn, namedExport) =>
  React.lazy(async () => {
    const mod = await importFn();
    const Component = mod.default || (namedExport ? mod[namedExport] : undefined) || Object.values(mod)[0];
    return { default: Component };
  });

// Lazy load pages
const StructureApp = lazyLoad(() => import('../pages/structure/StructureApp'), 'StructureApp');

// Division Pages
const DivisionList = lazyLoad(() => import('../components/structure/division/DivisionList'), 'DivisionList');
const DivisionForm = lazyLoad(() => import('../components/structure/division/DivisionForm'), 'DivisionForm');
const DivisionDetail = lazyLoad(() => import('../components/structure/division/DivisionDetail'), 'DivisionDetail');

// Department Pages
const DepartmentList = lazyLoad(() => import('../components/structure/department/DepartmentList'), 'DepartmentList');
const DepartmentForm = lazyLoad(() => import('../components/structure/department/DepartmentForm'), 'DepartmentForm');
const DepartmentDetail = lazyLoad(() => import('../components/structure/department/DepartmentDetail'), 'DepartmentDetail');
const DepartmentTree = lazyLoad(() => import('../components/structure/department/DepartmentTree'), 'DepartmentTree');

// Section Pages
const SectionList = lazyLoad(() => import('../components/structure/section/SectionList'), 'SectionList');
const SectionForm = lazyLoad(() => import('../components/structure/section/SectionForm'), 'SectionForm');
const SectionDetail = lazyLoad(() => import('../components/structure/section/SectionDetail'), 'SectionDetail');

// Unit Pages
const UnitList = lazyLoad(() => import('../components/structure/unit/UnitList'), 'UnitList');
const UnitForm = lazyLoad(() => import('../components/structure/unit/UnitForm'), 'UnitForm');
const UnitDetail = lazyLoad(() => import('../components/structure/unit/UnitDetail'), 'UnitDetail');

// Org Unit Pages
const OrgUnitList = lazyLoad(() => import('../components/structure/orgunit/OrgUnitList'), 'OrgUnitList');

// Position Pages
const PositionList = lazyLoad(() => import('../components/structure/position/PositionList'), 'PositionList');
const PositionForm = lazyLoad(() => import('../components/structure/position/PositionForm'), 'PositionForm');
const PositionDetail = lazyLoad(() => import('../components/structure/position/PositionDetail'), 'PositionDetail');

// Employment Pages
const EmploymentList = lazyLoad(() => import('../components/structure/employment/EmploymentList'), 'EmploymentList');
const EmploymentForm = lazyLoad(() => import('../components/structure/employment/EmploymentForm'), 'EmploymentForm');
const EmploymentDetail = lazyLoad(() => import('../components/structure/employment/EmploymentDetail'), 'EmploymentDetail');
const EmploymentTransfer = lazyLoad(() => import('../components/structure/employment/EmploymentTransfer'), 'EmploymentTransfer');

// Reporting Pages
const ReportingLineList = lazyLoad(() => import('../components/structure/reporting/ReportingLineList'), 'ReportingLineList');
const ReportingLineForm = lazyLoad(() => import('../components/structure/reporting/ReportingLineForm'), 'ReportingLineForm');
const ReportingChain = lazyLoad(() => import('../components/structure/reporting/ReportingChain'), 'ReportingChain');
const SpanOfControl = lazyLoad(() => import('../components/structure/reporting/SpanOfControl'), 'SpanOfControl');

// Interim Pages
const InterimAssignmentList = lazyLoad(() => import('../components/structure/interim/InterimAssignmentList'), 'InterimAssignmentList');
const InterimAssignmentForm = lazyLoad(() => import('../components/structure/interim/InterimAssignmentForm'), 'InterimAssignmentForm');
const InterimAssignmentDetail = lazyLoad(() => import('../components/structure/interim/InterimAssignmentDetail'), 'InterimAssignmentDetail');

// Cost Center Pages
const CostCenterList = lazyLoad(() => import('../components/structure/costcenter/CostCenterList'), 'CostCenterList');
const CostCenterForm = lazyLoad(() => import('../components/structure/costcenter/CostCenterForm'), 'CostCenterForm');
const CostCenterDetail = lazyLoad(() => import('../components/structure/costcenter/CostCenterDetail'), 'CostCenterDetail');
const CostCenterUtilization = lazyLoad(() => import('../components/structure/costcenter/CostCenterUtilization'), 'CostCenterUtilization');

// Location Pages
const LocationList = lazyLoad(() => import('../components/structure/location/LocationList'), 'LocationList');
const LocationForm = lazyLoad(() => import('../components/structure/location/LocationForm'), 'LocationForm');
const LocationDetail = lazyLoad(() => import('../components/structure/location/LocationDetail'), 'LocationDetail');

// Hierarchy Pages
const HierarchyVersionList = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchyVersionList');
const HierarchyCurrent = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchyCurrent');
const HierarchyValidate = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchyValidate');
const HierarchyVersionDetail = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchyVersionDetail');
const HierarchySnapshotCapture = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchySnapshotCapture');
const HierarchyVersionDiff = lazyLoad(() => import('../components/structure/hierarchy'), 'HierarchyVersionDiff');

// Org Chart Pages
const OrgChartView = lazyLoad(() => import('../components/structure/orgchart/OrgChartView'), 'OrgChartView');
const OrgChartTree = lazyLoad(() => import('../components/structure/orgchart/OrgChartTree'), 'OrgChartTree');
const OrgChartExport = lazyLoad(() => import('../components/structure/orgchart/OrgChartExport'), 'OrgChartExport');

// Dashboard Pages
const StructurePage = lazyLoad(() => import('../pages/structure/StructurePage'), 'StructurePage');
const StructureHealth = lazyLoad(() => import('../components/structure/dashboard/StructureHealth'), 'StructureHealth');

// Settings Pages
const StructureSettings = lazyLoad(() => import('../components/structure/settings/StructureSettings'), 'StructureSettings');
const ReferenceData = lazyLoad(() => import('../components/structure/settings/ReferenceData'), 'ReferenceData');

// Bulk Pages
const BulkDepartmentUpload = lazyLoad(() => import('../components/structure/bulk/BulkDepartmentUpload'), 'BulkDepartmentUpload');
const BulkEmploymentUpload = lazyLoad(() => import('../components/structure/bulk/BulkEmploymentUpload'), 'BulkEmploymentUpload');
const BulkReportingUpload = lazyLoad(() => import('../components/structure/bulk/BulkReportingUpload'), 'BulkReportingUpload');

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem' 
    }}>
        <div>Loading Structure...</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

// Export route constants for navigation
import { STRUCTURE_ROUTES, buildStructurePath } from '../config/constants/structureRouteConstants';
export { STRUCTURE_ROUTES, buildStructurePath };

// Flat routes array - follows your Config/Billing/KPI pattern
const structureRoutes = [
    // Dashboard
    { path: STRUCTURE_ROUTES.DASHBOARD, element: withSuspense(StructurePage) },
    { path: STRUCTURE_ROUTES.DASHBOARD_HEALTH, element: withSuspense(StructureHealth) },
    { path: '/structure', element: <Navigate to={STRUCTURE_ROUTES.DASHBOARD} replace /> },
    
    // Organizational Units
    { path: STRUCTURE_ROUTES.ORG_UNITS, element: withSuspense(OrgUnitList) },
    { path: STRUCTURE_ROUTES.ORG_UNIT_TREE, element: withSuspense(DepartmentTree) },
    { path: STRUCTURE_ROUTES.ORG_UNIT_DETAIL(), element: withSuspense(DepartmentDetail) },
    
    // Divisions
    { path: STRUCTURE_ROUTES.DIVISIONS, element: withSuspense(DivisionList) },
    { path: STRUCTURE_ROUTES.DIVISION_CREATE, element: withSuspense(DivisionForm) },
    { path: STRUCTURE_ROUTES.DIVISION_DETAIL(), element: withSuspense(DivisionDetail) },
    { path: STRUCTURE_ROUTES.DIVISION_EDIT(), element: withSuspense(DivisionForm) },
    
    // Departments
    { path: STRUCTURE_ROUTES.DEPARTMENTS, element: withSuspense(DepartmentList) },
    { path: STRUCTURE_ROUTES.DEPARTMENT_CREATE, element: withSuspense(DepartmentForm) },
    { path: STRUCTURE_ROUTES.DEPARTMENT_TREE, element: withSuspense(DepartmentTree) },
    { path: STRUCTURE_ROUTES.DEPARTMENT_DETAIL(), element: withSuspense(DepartmentDetail) },
    { path: STRUCTURE_ROUTES.DEPARTMENT_EDIT(), element: withSuspense(DepartmentForm) },
    
    // Sections
    { path: STRUCTURE_ROUTES.SECTIONS, element: withSuspense(SectionList) },
    { path: STRUCTURE_ROUTES.SECTION_CREATE, element: withSuspense(SectionForm) },
    { path: STRUCTURE_ROUTES.SECTION_DETAIL(), element: withSuspense(SectionDetail) },
    { path: STRUCTURE_ROUTES.SECTION_EDIT(), element: withSuspense(SectionForm) },
    
    // Units
    { path: STRUCTURE_ROUTES.UNITS, element: withSuspense(UnitList) },
    { path: STRUCTURE_ROUTES.UNIT_CREATE, element: withSuspense(UnitForm) },
    { path: STRUCTURE_ROUTES.UNIT_DETAIL(), element: withSuspense(UnitDetail) },
    { path: STRUCTURE_ROUTES.UNIT_EDIT(), element: withSuspense(UnitForm) },
    
    // Positions
    { path: STRUCTURE_ROUTES.POSITIONS, element: withSuspense(PositionList) },
    { path: STRUCTURE_ROUTES.POSITION_CREATE, element: withSuspense(PositionForm) },
    { path: STRUCTURE_ROUTES.POSITION_VACANT, element: withSuspense(PositionList) },
    { path: STRUCTURE_ROUTES.POSITION_REPORTING_CHAIN(), element: withSuspense(ReportingChain) },
    { path: STRUCTURE_ROUTES.POSITION_DETAIL(), element: withSuspense(PositionDetail) },
    { path: STRUCTURE_ROUTES.POSITION_EDIT(), element: withSuspense(PositionForm) },
    
    // Employments
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, element: withSuspense(EmploymentList) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_CREATE, element: withSuspense(EmploymentForm) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, element: withSuspense(EmploymentTransfer) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_CURRENT, element: withSuspense(EmploymentList) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_BY_USER(), element: withSuspense(EmploymentList) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(), element: withSuspense(EmploymentDetail) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_EDIT(), element: withSuspense(EmploymentForm) },
    { path: STRUCTURE_ROUTES.MY_EMPLOYMENT, element: withSuspense(EmploymentDetail) },
    
    // Reporting
    { path: STRUCTURE_ROUTES.REPORTING_LINES, element: withSuspense(ReportingLineList) },
    { path: STRUCTURE_ROUTES.REPORTING_LINE_CREATE, element: withSuspense(ReportingLineForm) },
    { path: STRUCTURE_ROUTES.REPORTING_CHAIN(), element: withSuspense(ReportingChain) },
    { path: STRUCTURE_ROUTES.SPAN_OF_CONTROL(), element: withSuspense(SpanOfControl) },
    { path: STRUCTURE_ROUTES.REPORTING_LINE_DETAIL(), element: withSuspense(ReportingLineList) },
    { path: STRUCTURE_ROUTES.REPORTING_LINE_EDIT(), element: withSuspense(ReportingLineForm) },
    { path: STRUCTURE_ROUTES.MY_CHAIN, element: withSuspense(ReportingChain) },
    { path: STRUCTURE_ROUTES.ORGANIZATION_SPAN, element: withSuspense(SpanOfControl) },
    
    // Interim
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS, element: withSuspense(InterimAssignmentList) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_CREATE, element: withSuspense(InterimAssignmentForm) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_ACTIVE, element: withSuspense(InterimAssignmentList) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_EXPIRING, element: withSuspense(InterimAssignmentList) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_DETAIL(), element: withSuspense(InterimAssignmentDetail) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_EDIT(), element: withSuspense(InterimAssignmentForm) },
    
    // Cost Centers
    { path: STRUCTURE_ROUTES.COST_CENTERS, element: withSuspense(CostCenterList) },
    { path: STRUCTURE_ROUTES.COST_CENTER_CREATE, element: withSuspense(CostCenterForm) },
    { path: STRUCTURE_ROUTES.COST_CENTER_STATS, element: withSuspense(CostCenterList) },
    { path: STRUCTURE_ROUTES.COST_CENTER_DETAIL(), element: withSuspense(CostCenterDetail) },
    { path: STRUCTURE_ROUTES.COST_CENTER_EDIT(), element: withSuspense(CostCenterForm) },
    { path: STRUCTURE_ROUTES.COST_CENTER_UTILIZATION(), element: withSuspense(CostCenterUtilization) },
    
    // Locations
    { path: STRUCTURE_ROUTES.LOCATIONS, element: withSuspense(LocationList) },
    { path: STRUCTURE_ROUTES.LOCATION_CREATE, element: withSuspense(LocationForm) },
    { path: STRUCTURE_ROUTES.LOCATION_HEADQUARTERS, element: withSuspense(LocationList) },
    { path: STRUCTURE_ROUTES.LOCATION_STATS, element: withSuspense(LocationList) },
    { path: STRUCTURE_ROUTES.LOCATION_DETAIL(), element: withSuspense(LocationDetail) },
    { path: STRUCTURE_ROUTES.LOCATION_EDIT(), element: withSuspense(LocationForm) },
    
    // Hierarchy
    { path: STRUCTURE_ROUTES.HIERARCHY, element: withSuspense(HierarchyVersionList) },
    { path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE, element: withSuspense(HierarchySnapshotCapture) },
    { path: STRUCTURE_ROUTES.HIERARCHY_DIFF(), element: withSuspense(HierarchyVersionDiff) },
    { path: STRUCTURE_ROUTES.HIERARCHY_DETAIL(), element: withSuspense(HierarchyVersionDetail) },
    { path: STRUCTURE_ROUTES.HIERARCHY_CURRENT, element: withSuspense(HierarchyCurrent) },
    { path: STRUCTURE_ROUTES.HIERARCHY_HISTORY, element: withSuspense(HierarchyVersionList) },
    { path: STRUCTURE_ROUTES.HIERARCHY_VALIDATE, element: withSuspense(HierarchyValidate) },
    
    // Org Charts
    { path: STRUCTURE_ROUTES.ORG_CHARTS, element: withSuspense(OrgChartView) },
    { path: STRUCTURE_ROUTES.ORG_CHART_TREE, element: withSuspense(OrgChartTree) },
    { path: STRUCTURE_ROUTES.ORG_CHART_EXPORT, element: withSuspense(OrgChartExport) },
    
    // Settings
    { path: STRUCTURE_ROUTES.SYSTEM_SETTINGS, element: withSuspense(StructureSettings) },
    { path: STRUCTURE_ROUTES.REFERENCE_DATA, element: withSuspense(ReferenceData) },
    
    // Bulk
    { path: STRUCTURE_ROUTES.BULK_DEPARTMENTS, element: withSuspense(BulkDepartmentUpload) },
    { path: STRUCTURE_ROUTES.BULK_EMPLOYMENTS, element: withSuspense(BulkEmploymentUpload) },
    { path: STRUCTURE_ROUTES.BULK_REPORTING, element: withSuspense(BulkReportingUpload) },
];

export default structureRoutes;