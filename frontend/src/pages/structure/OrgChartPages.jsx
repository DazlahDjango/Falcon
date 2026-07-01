import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  OrgChartView,
  OrgChartTree,
  OrgChartExport,
} from '../../components/structure/orgchart';

export const OrgChartPages = () => {
  return (
    <Routes>
      <Route index element={<OrgChartView />} />
      <Route path="tree" element={<OrgChartTree />} />
      <Route path="export" element={<OrgChartExport />} />
    </Routes>
  );
};

export default OrgChartPages;