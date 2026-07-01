import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  SectionList,
  SectionForm,
  SectionDetail,
} from '../../components/structure/section';

export const SectionPages = () => {
  return (
    <Routes>
      <Route index element={<SectionList />} />
      <Route path="create" element={<SectionForm />} />
      <Route path=":id" element={<SectionDetail />} />
      <Route path=":id/edit" element={<SectionForm />} />
    </Routes>
  );
};

export default SectionPages;