import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  DivisionPages,
  DepartmentPages,
  SectionPages,
  UnitPages,
  PositionPages,
  EmploymentPages,
  ReportingPages,
  InterimPages,
  CostCenterPages,
  LocationPages,
  HierarchyPages,
  OrgChartPages,
  DashboardPages,
  SettingsPages,
  BulkPages,
} from './index';
import '../../components/structure/structure.css';

export const StructureApp = () => {
  return (
    <div className="structure-app">
      <Routes>
        <Route path="/" element={<Navigate to="/structure/dashboard" replace />} />
        <Route path="divisions/*" element={<DivisionPages />} />
        <Route path="departments/*" element={<DepartmentPages />} />
        <Route path="sections/*" element={<SectionPages />} />
        <Route path="units/*" element={<UnitPages />} />
        <Route path="positions/*" element={<PositionPages />} />
        <Route path="employments/*" element={<EmploymentPages />} />
        <Route path="reporting/*" element={<ReportingPages />} />
        <Route path="interim/*" element={<InterimPages />} />
        <Route path="cost-centers/*" element={<CostCenterPages />} />
        <Route path="locations/*" element={<LocationPages />} />
        <Route path="hierarchy/*" element={<HierarchyPages />} />
        <Route path="org-charts/*" element={<OrgChartPages />} />
        <Route path="dashboard/*" element={<DashboardPages />} />
        <Route path="settings/*" element={<SettingsPages />} />
        <Route path="bulk/*" element={<BulkPages />} />
      </Routes>
    </div>
  );
};

export default StructureApp;