import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  StructureSettings,
  ReferenceData,
} from '../../components/structure/settings';

export const SettingsPages = () => {
  return (
    <Routes>
      <Route index element={<StructureSettings />} />
      <Route path="reference" element={<ReferenceData />} />
    </Routes>
  );
};

export default SettingsPages;