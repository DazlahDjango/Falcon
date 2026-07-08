import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  HierarchyVersionList,
  HierarchyVersionDetail,
  HierarchySnapshotCapture,
  HierarchyVersionDiff,
} from '../../components/structure/hierarchy';

export const HierarchyPages = () => {
  return (
    <Routes>
      <Route index element={<HierarchyVersionList />} />
      <Route path="capture" element={<HierarchySnapshotCapture />} />
      <Route path="diff/:id/:compareToId" element={<HierarchyVersionDiff />} />
      <Route path=":id" element={<HierarchyVersionDetail />} />
    </Routes>
  );
};

export default HierarchyPages;