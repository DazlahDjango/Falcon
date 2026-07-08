import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  CostCenterList,
  CostCenterForm,
  CostCenterDetail,
  CostCenterUtilization,
} from '../../components/structure/costcenter';

export const CostCenterPages = () => {
  return (
    <Routes>
      <Route index element={<CostCenterList />} />
      <Route path="create" element={<CostCenterForm />} />
      <Route path=":id" element={<CostCenterDetail />} />
      <Route path=":id/edit" element={<CostCenterForm />} />
      <Route path=":id/utilization" element={<CostCenterUtilization />} />
    </Routes>
  );
};

export default CostCenterPages;