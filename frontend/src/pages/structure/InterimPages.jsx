import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  InterimAssignmentList,
  InterimAssignmentForm,
  InterimAssignmentDetail,
} from '../../components/structure/interim';

export const InterimPages = () => {
  return (
    <Routes>
      <Route index element={<InterimAssignmentList />} />
      <Route path="create" element={<InterimAssignmentForm />} />
      <Route path=":id" element={<InterimAssignmentDetail />} />
      <Route path=":id/edit" element={<InterimAssignmentForm />} />
    </Routes>
  );
};

export default InterimPages;