import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  EmploymentList,
  EmploymentForm,
  EmploymentDetail,
  EmploymentTransfer,
} from '../../components/structure/employment';

export const EmploymentPages = () => {
  return (
    <Routes>
      <Route index element={<EmploymentList />} />
      <Route path="create" element={<EmploymentForm />} />
      <Route path="transfer" element={<EmploymentTransfer />} />
      <Route path=":id" element={<EmploymentDetail />} />
      <Route path=":id/edit" element={<EmploymentForm />} />
    </Routes>
  );
};

export default EmploymentPages;