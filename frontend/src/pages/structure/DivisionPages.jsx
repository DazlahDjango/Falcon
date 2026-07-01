import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  DivisionList,
  DivisionForm,
  DivisionDetail,
} from '../../components/structure/division';

export const DivisionPages = () => {
  return (
    <Routes>
      <Route index element={<DivisionList />} />
      <Route path="create" element={<DivisionForm />} />
      <Route path=":id" element={<DivisionDetail />} />
      <Route path=":id/edit" element={<DivisionForm />} />
    </Routes>
  );
};

export default DivisionPages;