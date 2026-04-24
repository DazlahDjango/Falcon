import { useState, useEffect } from 'react';
import { featureFlagApi } from '../../services/organisations/api';

export const useFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeatureFlags = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await featureFlagApi.getAll();
      setFeatureFlags(response.data.results || response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch feature flags');
      console.error('Feature flags fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFeatureFlag = async (data) => {
    try {
      const response = await featureFlagApi.create(data);
      setFeatureFlags(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Create feature flag error:', err);
      throw err;
    }
  };

  const updateFeatureFlag = async (id, data) => {
    try {
      const response = await featureFlagApi.update(id, data);
      setFeatureFlags(prev => prev.map(flag =>
        flag.id === id ? response.data : flag
      ));
      return response.data;
    } catch (err) {
      console.error('Update feature flag error:', err);
      throw err;
    }
  };

  const deleteFeatureFlag = async (id) => {
    try {
      await featureFlagApi.delete(id);
      setFeatureFlags(prev => prev.filter(flag => flag.id !== id));
    } catch (err) {
      console.error('Delete feature flag error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  return {
    featureFlags,
    loading,
    error,
    fetchFeatureFlags,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
  };
};