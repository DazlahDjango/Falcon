import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  StructureDashboard,
  StructureHealth,
} from '../../components/structure/dashboard';

export const DashboardPages = () => {
  return (
    <Routes>
      <Route index element={<StructureDashboard />} />
      <Route path="health" element={<StructureHealth />} />
    </Routes>
  );
};

export default DashboardPages;