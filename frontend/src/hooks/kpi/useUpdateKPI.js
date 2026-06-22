/**
 * Hook for updating KPIs
 */
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateKPI } from '../../store/kpi';

const useUpdateKPI = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const update = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(updateKPI({ id, data })).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    return {
        update,
        loading,
        error,
    };
};

export default useUpdateKPI;