import React, { createContext, useContext, useState, useEffect } from 'react';
import { organisationService } from '../services/organisationService';

const OrganisationContext = createContext();

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within OrganisationProvider');
  }
  return context;
};

export const OrganisationProvider = ({ children }) => {
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganisation = async () => {
    try {
      setLoading(true);
      const response = await organisationService.getCurrent();
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
      const updatedOrg = await organisationService.updateOrganisation(organisation.id, data);
      setOrganisation(updatedOrg);
      return { success: true, data: updatedOrg };
    } catch (err) {
      console.error('Error updating organisation:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchOrganisation();
  }, []);

  const value = {
    organisation,
    loading,
    error,
    updateOrganisation,
    refreshOrganisation: fetchOrganisation,
  };

  return (
    <OrganisationContext.Provider value={value}>
      {children}
    </OrganisationContext.Provider>
  );
};