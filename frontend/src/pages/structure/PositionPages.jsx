import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PositionList,
  PositionForm,
  PositionDetail,
} from '../../components/structure/position';

export const PositionPages = () => {
  return (
    <Routes>
      <Route index element={<PositionList />} />
      <Route path="create" element={<PositionForm />} />
      <Route path=":id" element={<PositionDetail />} />
      <Route path=":id/edit" element={<PositionForm />} />
    </Routes>
  );
};

export default PositionPages;