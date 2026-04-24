import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { organisationApi } from '../../services/organisations/organisationService';

export const useHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const organisation = useSelector((state) => state.organisation.current);

  const fetchHierarchy = async () => {
    if (!organisation?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Since Hierarchy model is deprecated, we'll use user relationships
      // This would need to be implemented in the backend to return hierarchy data
      const response = await organisationApi.getHierarchy(organisation.id);
      setHierarchy(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch hierarchy');
      console.error('Hierarchy fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organisation?.id) {
      fetchHierarchy();
    }
  }, [organisation?.id]);

  return {
    hierarchy,
    loading,
    error,
    fetchHierarchy,
  };
};