import React, { createContext, useContext, useState, useEffect } from 'react';
import { organisationApi } from '../../services/organisation/organisationService';
import { useAuthContext } from '../accounts/AuthContext';

const OrganisationContext = createContext();

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within OrganisationProvider');
  }
  return context;
};

export const OrganisationProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganisation = async () => {
    if (!isAuthenticated) {
      setOrganisation(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await organisationApi.getCurrent();
      setOrganisation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch organisation');
      console.error('Error fetching organisation:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganisation = async (data) => {
    try {
      const response = await organisationApi.update(organisation.id, data);
      setOrganisation(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const uploadLogo = async (file) => {
    try {
      const response = await organisationApi.uploadLogo(file);
      setOrganisation(prev => ({ ...prev, logo: response.data.logo_url }));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchOrganisation();
  }, [isAuthenticated]);

  const value = {
    organisation,
    loading,
    error,
    updateOrganisation,
    uploadLogo,
    refreshOrganisation: fetchOrganisation,
  };

  return (
    <OrganisationContext.Provider value={value}>
      {children}
    </OrganisationContext.Provider>
  );
};