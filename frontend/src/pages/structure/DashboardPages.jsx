import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StructurePage } from './StructurePage';
import { StructureHealth } from '../../components/structure/dashboard';

export const DashboardPages = () => {
  return (
    <Routes>
      <Route index element={<StructurePage />} />
      <Route path="health" element={<StructureHealth />} />
    </Routes>
  );
};

export default DashboardPages;