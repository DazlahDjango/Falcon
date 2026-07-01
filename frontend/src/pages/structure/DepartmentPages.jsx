import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  DepartmentList,
  DepartmentForm,
  DepartmentDetail,
  DepartmentTree,
} from '../../components/structure/department';

export const DepartmentPages = () => {
  return (
    <Routes>
      <Route index element={<DepartmentList />} />
      <Route path="create" element={<DepartmentForm />} />
      <Route path="tree" element={<DepartmentTree />} />
      <Route path=":id" element={<DepartmentDetail />} />
      <Route path=":id/edit" element={<DepartmentForm />} />
    </Routes>
  );
};

export default DepartmentPages;