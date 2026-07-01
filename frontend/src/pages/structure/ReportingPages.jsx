import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  ReportingLineList,
  ReportingLineForm,
  ReportingChain,
  SpanOfControl,
} from '../../components/structure/reporting';

export const ReportingPages = () => {
  return (
    <Routes>
      <Route index element={<ReportingLineList />} />
      <Route path="create" element={<ReportingLineForm />} />
      <Route path="chain" element={<ReportingChain />} />
      <Route path="span-of-control" element={<SpanOfControl />} />
      <Route path=":id" element={<ReportingLineList />} />
      <Route path=":id/edit" element={<ReportingLineForm />} />
    </Routes>
  );
};

export default ReportingPages;