import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LocationList,
  LocationForm,
  LocationDetail,
} from '../../components/structure/location';

export const LocationPages = () => {
  return (
    <Routes>
      <Route index element={<LocationList />} />
      <Route path="create" element={<LocationForm />} />
      <Route path=":id" element={<LocationDetail />} />
      <Route path=":id/edit" element={<LocationForm />} />
    </Routes>
  );
};

export default LocationPages;