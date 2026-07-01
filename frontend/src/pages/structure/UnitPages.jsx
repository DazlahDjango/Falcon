import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  UnitList,
  UnitForm,
  UnitDetail,
} from '../../components/structure/unit';

export const UnitPages = () => {
  return (
    <Routes>
      <Route index element={<UnitList />} />
      <Route path="create" element={<UnitForm />} />
      <Route path=":id" element={<UnitDetail />} />
      <Route path=":id/edit" element={<UnitForm />} />
    </Routes>
  );
};

export default UnitPages;