import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateKPI, selectKPIValidation } from '../../store/kpi';

const useKPIValidation = (kpiId) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const validation = useSelector(selectKPIValidation);
    
    const validate = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(validateKPI(kpiId)).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch, kpiId]);
    
    return {
        validation,
        loading,
        error,
        validate,
        isValid: validation?.is_valid || false,
        completenessErrors: validation?.completeness_errors || [],
        weightValid: validation?.weight_validation?.valid || false,
        circularValid: validation?.circular_dependency?.valid || false,
    };
};

export default useKPIValidation;