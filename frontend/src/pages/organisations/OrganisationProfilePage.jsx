/**
 * Organisation Profile Page
 * View and edit organisation profile
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentOrganisation } from '../../store/organisations/slice/organisationSlice';
import { OrganisationProfile } from '../../components/organisations/profile/OrganisationProfile';

const OrganisationProfilePage = () => {
  const dispatch = useDispatch();
  const { currentOrganisation, loading } = useSelector((state) => state.organisation);

  useEffect(() => {
    dispatch(fetchCurrentOrganisation());
  }, [dispatch]);

  if (loading && !currentOrganisation) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <OrganisationProfile organisation={currentOrganisation} />;
};

export default OrganisationProfilePage;