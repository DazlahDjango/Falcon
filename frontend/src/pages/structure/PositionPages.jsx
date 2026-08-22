import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PositionList,
  PositionForm,
  PositionDetail,
} from '../../components/structure/position';
import { ReportingChain } from '../../components/structure/reporting';

export const PositionPages = () => {
  return (
    <Routes>
      <Route index element={<PositionList />} />
      <Route path="create" element={<PositionForm />} />
      <Route path=":id" element={<PositionDetail />} />
      <Route path=":id/edit" element={<PositionForm />} />
      <Route path=":id/chain" element={<ReportingChain />} />
    </Routes>
  );
};

export default PositionPages;