import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createKPI } from '../../store/kpi';

const useCreateKPI = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const create = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(createKPI(data)).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    return {
        create,
        loading,
        error,
    };
};

export default useCreateKPI;