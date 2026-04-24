/**
 * Organisation API Tokens Page
 * Manage API tokens for programmatic access
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiKeys } from '../../store/organisations/slice/settingsSlice';
import { APITokens } from '../../components/organisations/settings';

const OrganisationApiTokensPage = () => {
  const dispatch = useDispatch();
  const { apiKeys, loading } = useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchApiKeys());
  }, [dispatch]);

  if (loading && !apiKeys) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <APITokens apiKeys={apiKeys} loading={loading} />;
};

export default OrganisationApiTokensPage;