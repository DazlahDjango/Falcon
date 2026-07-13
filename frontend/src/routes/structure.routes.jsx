import React from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load pages
const StructureApp = React.lazy(() => import('../pages/structure/StructureApp').then(module => ({ default: module.StructureApp })));

// Division Pages
const DivisionList = React.lazy(() => import('../components/structure/division/DivisionList').then(module => ({ default: module.DivisionList })));
const DivisionForm = React.lazy(() => import('../components/structure/division/DivisionForm').then(module => ({ default: module.DivisionForm })));
const DivisionDetail = React.lazy(() => import('../components/structure/division/DivisionDetail').then(module => ({ default: module.DivisionDetail })));

// Department Pages
const DepartmentList = React.lazy(() => import('../components/structure/department/DepartmentList').then(module => ({ default: module.DepartmentList })));
const DepartmentForm = React.lazy(() => import('../components/structure/department/DepartmentForm').then(module => ({ default: module.DepartmentForm })));
const DepartmentDetail = React.lazy(() => import('../components/structure/department/DepartmentDetail').then(module => ({ default: module.DepartmentDetail })));
const DepartmentTree = React.lazy(() => import('../components/structure/department/DepartmentTree').then(module => ({ default: module.DepartmentTree })));

// Section Pages
const SectionList = React.lazy(() => import('../components/structure/section/SectionList').then(module => ({ default: module.SectionList })));
const SectionForm = React.lazy(() => import('../components/structure/section/SectionForm').then(module => ({ default: module.SectionForm })));
const SectionDetail = React.lazy(() => import('../components/structure/section/SectionDetail').then(module => ({ default: module.SectionDetail })));

// Unit Pages
const UnitList = React.lazy(() => import('../components/structure/unit/UnitList').then(module => ({ default: module.UnitList })));
const UnitForm = React.lazy(() => import('../components/structure/unit/UnitForm').then(module => ({ default: module.UnitForm })));
const UnitDetail = React.lazy(() => import('../components/structure/unit/UnitDetail').then(module => ({ default: module.UnitDetail })));

// Org Unit Pages
const OrgUnitList = React.lazy(() => import('../components/structure/orgunit/OrgUnitList').then(module => ({ default: module.OrgUnitList })));

// Position Pages
const PositionList = React.lazy(() => import('../components/structure/position/PositionList').then(module => ({ default: module.PositionList })));
const PositionForm = React.lazy(() => import('../components/structure/position/PositionForm').then(module => ({ default: module.PositionForm })));
const PositionDetail = React.lazy(() => import('../components/structure/position/PositionDetail').then(module => ({ default: module.PositionDetail })));

// Employment Pages
const EmploymentList = React.lazy(() => import('../components/structure/employment/EmploymentList').then(module => ({ default: module.EmploymentList })));
const EmploymentForm = React.lazy(() => import('../components/structure/employment/EmploymentForm').then(module => ({ default: module.EmploymentForm })));
const EmploymentDetail = React.lazy(() => import('../components/structure/employment/EmploymentDetail').then(module => ({ default: module.EmploymentDetail })));
const EmploymentTransfer = React.lazy(() => import('../components/structure/employment/EmploymentTransfer').then(module => ({ default: module.EmploymentTransfer })));

// Reporting Pages
const ReportingLineList = React.lazy(() => import('../components/structure/reporting/ReportingLineList').then(module => ({ default: module.ReportingLineList })));
const ReportingLineForm = React.lazy(() => import('../components/structure/reporting/ReportingLineForm').then(module => ({ default: module.ReportingLineForm })));
const ReportingChain = React.lazy(() => import('../components/structure/reporting/ReportingChain').then(module => ({ default: module.ReportingChain })));
const SpanOfControl = React.lazy(() => import('../components/structure/reporting/SpanOfControl').then(module => ({ default: module.SpanOfControl })));

// Interim Pages
const InterimAssignmentList = React.lazy(() => import('../components/structure/interim/InterimAssignmentList').then(module => ({ default: module.InterimAssignmentList })));
const InterimAssignmentForm = React.lazy(() => import('../components/structure/interim/InterimAssignmentForm').then(module => ({ default: module.InterimAssignmentForm })));
const InterimAssignmentDetail = React.lazy(() => import('../components/structure/interim/InterimAssignmentDetail').then(module => ({ default: module.InterimAssignmentDetail })));

// Cost Center Pages
const CostCenterList = React.lazy(() => import('../components/structure/costcenter/CostCenterList').then(module => ({ default: module.CostCenterList })));
const CostCenterForm = React.lazy(() => import('../components/structure/costcenter/CostCenterForm').then(module => ({ default: module.CostCenterForm })));
const CostCenterDetail = React.lazy(() => import('../components/structure/costcenter/CostCenterDetail').then(module => ({ default: module.CostCenterDetail })));
const CostCenterUtilization = React.lazy(() => import('../components/structure/costcenter/CostCenterUtilization').then(module => ({ default: module.CostCenterUtilization })));

// Location Pages
const LocationList = React.lazy(() => import('../components/structure/location/LocationList').then(module => ({ default: module.LocationList })));
const LocationForm = React.lazy(() => import('../components/structure/location/LocationForm').then(module => ({ default: module.LocationForm })));
const LocationDetail = React.lazy(() => import('../components/structure/location/LocationDetail').then(module => ({ default: module.LocationDetail })));

// Hierarchy Pages
const HierarchyVersionList = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchyVersionList })));
const HierarchyCurrent = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchyCurrent })));
const HierarchyValidate = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchyValidate })));
const HierarchyVersionDetail = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchyVersionDetail })));
const HierarchySnapshotCapture = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchySnapshotCapture })));
const HierarchyVersionDiff = React.lazy(() => import('../components/structure/hierarchy').then(module => ({ default: module.HierarchyVersionDiff })));

// Org Chart Pages
const OrgChartView = React.lazy(() => import('../components/structure/orgchart/OrgChartView').then(module => ({ default: module.OrgChartView })));
const OrgChartTree = React.lazy(() => import('../components/structure/orgchart/OrgChartTree').then(module => ({ default: module.OrgChartTree })));
const OrgChartExport = React.lazy(() => import('../components/structure/orgchart/OrgChartExport').then(module => ({ default: module.OrgChartExport })));

// Dashboard Pages
const StructurePage = React.lazy(() => import('../pages/structure/StructurePage').then(module => ({ default: module.StructurePage })));
const StructureHealth = React.lazy(() => import('../components/structure/dashboard/StructureHealth').then(module => ({ default: module.StructureHealth })));

// Settings Pages
const StructureSettings = React.lazy(() => import('../components/structure/settings/StructureSettings').then(module => ({ default: module.StructureSettings })));
const ReferenceData = React.lazy(() => import('../components/structure/settings/ReferenceData').then(module => ({ default: module.ReferenceData })));

// Bulk Pages
const BulkDepartmentUpload = React.lazy(() => import('../components/structure/bulk/BulkDepartmentUpload').then(module => ({ default: module.BulkDepartmentUpload })));
const BulkEmploymentUpload = React.lazy(() => import('../components/structure/bulk/BulkEmploymentUpload').then(module => ({ default: module.BulkEmploymentUpload })));
const BulkReportingUpload = React.lazy(() => import('../components/structure/bulk/BulkReportingUpload').then(module => ({ default: module.BulkReportingUpload })));

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
    { path: STRUCTURE_ROUTES.POSITION_DETAIL(), element: withSuspense(PositionDetail) },
    { path: STRUCTURE_ROUTES.POSITION_EDIT(), element: withSuspense(PositionForm) },
    
    // Employments
    { path: STRUCTURE_ROUTES.EMPLOYMENTS, element: withSuspense(EmploymentList) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_CREATE, element: withSuspense(EmploymentForm) },
    { path: STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER, element: withSuspense(EmploymentTransfer) },
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
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_DETAIL(), element: withSuspense(InterimAssignmentDetail) },
    { path: STRUCTURE_ROUTES.INTERIM_ASSIGNMENT_EDIT(), element: withSuspense(InterimAssignmentForm) },
    
    // Cost Centers
    { path: STRUCTURE_ROUTES.COST_CENTERS, element: withSuspense(CostCenterList) },
    { path: STRUCTURE_ROUTES.COST_CENTER_CREATE, element: withSuspense(CostCenterForm) },
    { path: STRUCTURE_ROUTES.COST_CENTER_DETAIL(), element: withSuspense(CostCenterDetail) },
    { path: STRUCTURE_ROUTES.COST_CENTER_EDIT(), element: withSuspense(CostCenterForm) },
    { path: STRUCTURE_ROUTES.COST_CENTER_UTILIZATION(), element: withSuspense(CostCenterUtilization) },
    
    // Locations
    { path: STRUCTURE_ROUTES.LOCATIONS, element: withSuspense(LocationList) },
    { path: STRUCTURE_ROUTES.LOCATION_CREATE, element: withSuspense(LocationForm) },
    { path: STRUCTURE_ROUTES.LOCATION_DETAIL(), element: withSuspense(LocationDetail) },
    { path: STRUCTURE_ROUTES.LOCATION_EDIT(), element: withSuspense(LocationForm) },
    
    // Hierarchy
    { path: STRUCTURE_ROUTES.HIERARCHY, element: withSuspense(HierarchyVersionList) },
    { path: STRUCTURE_ROUTES.HIERARCHY_CAPTURE, element: withSuspense(HierarchySnapshotCapture) },
    { path: STRUCTURE_ROUTES.HIERARCHY_DIFF(), element: withSuspense(HierarchyVersionDiff) },
    { path: STRUCTURE_ROUTES.HIERARCHY_DETAIL, element: withSuspense(HierarchyVersionDetail) },
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