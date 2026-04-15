/**
 * Organisation Branding Page
 * Customise organisation visual identity
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranding } from '../../store/organisation/slice/brandingSlice';
import { BrandingEditor } from '../../components/Organisation/branding';

const OrganisationBrandingPage = () => {
  const dispatch = useDispatch();
  const { branding, loading } = useSelector((state) => state.branding);

  useEffect(() => {
    dispatch(fetchBranding());
  }, [dispatch]);

  if (loading && !branding) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <BrandingEditor branding={branding} />;
};

export default OrganisationBrandingPage;