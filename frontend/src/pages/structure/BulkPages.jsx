import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  BulkDepartmentUpload,
  BulkEmploymentUpload,
  BulkReportingUpload,
} from '../../components/structure/bulk';

export const BulkPages = () => {
  return (
    <Routes>
      <Route index element={<BulkDepartmentUpload />} />
      <Route path="departments" element={<BulkDepartmentUpload />} />
      <Route path="employments" element={<BulkEmploymentUpload />} />
      <Route path="reporting" element={<BulkReportingUpload />} />
    </Routes>
  );
};

export default BulkPages;