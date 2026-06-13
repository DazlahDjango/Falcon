import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createActual } from '../../store/kpi';

const useSubmitActual = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const submit = useCallback(async (data, evidenceFile = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(createActual({ data, evidenceFile })).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    return {
        submit,
        loading,
        error,
    };
};

export default useSubmitActual;