import React, { createContext, useContext, useState, useEffect } from 'react';
import { featureFlagApi } from '../../services/organisation/api';
import { useOrganisation } from './OrganisationContext';

const FeatureContext = createContext();

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureProvider');
  }
  return context;
};

export const FeatureProvider = ({ children }) => {
  const { organisation } = useOrganisation();
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatures = async () => {
    if (!organisation) return;
    
    try {
      setLoading(true);
      const response = await featureFlagApi.getAll();
      const featuresMap = {};
      (response.data.results || response.data || []).forEach(flag => {
        featuresMap[flag.feature_name] = flag.is_enabled;
      });
      setFeatures(featuresMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch features');
      console.error('Error fetching features:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName) => {
    return features[featureName] === true;
  };

  const enableFeature = async (featureName) => {
    try {
      const response = await featureFlagApi.enable(featureName);
      setFeatures(prev => ({ ...prev, [featureName]: true }));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const disableFeature = async (featureName) => {
    try {
      const response = await featureFlagApi.disable(featureName);
      setFeatures(prev => ({ ...prev, [featureName]: false }));
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [organisation]);

  const value = {
    features,
    loading,
    error,
    hasFeature,
    enableFeature,
    disableFeature,
    refreshFeatures: fetchFeatures,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};