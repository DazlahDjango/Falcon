import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { deleteKPI } from '../../store/kpi';

const useDeleteKPI = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const remove = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(deleteKPI(id)).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    return {
        delete: remove,
        loading,
        error,
    };
};

export default useDeleteKPI;