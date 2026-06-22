/**
 * Hook for managing single actual
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchActual,
    updateActual,
    submitActual,
    approveActual,
    rejectActual,
    resubmitActual,
    selectCurrentActual,
    selectActualLoading,
    selectActualError
} from '../../store/kpi';

const useActual = (id) => {
    const dispatch = useDispatch();
    
    const actual = useSelector(selectCurrentActual);
    const loading = useSelector(selectActualLoading);
    const error = useSelector(selectActualError);
    
    const loadActual = useCallback(() => {
        if (id) {
            dispatch(fetchActual(id));
        }
    }, [dispatch, id]);
    
    const update = useCallback(async (data) => {
        return dispatch(updateActual({ id, data })).unwrap();
    }, [dispatch, id]);
    
    const submit = useCallback(async () => {
        return dispatch(submitActual(id)).unwrap();
    }, [dispatch, id]);
    
    const approve = useCallback(async (comment = '') => {
        return dispatch(approveActual({ id, comment })).unwrap();
    }, [dispatch, id]);
    
    const reject = useCallback(async (reasonId, comment = '') => {
        return dispatch(rejectActual({ id, reasonId, comment })).unwrap();
    }, [dispatch, id]);
    
    const resubmit = useCallback(async (actualValue, notes = '') => {
        return dispatch(resubmitActual({ id, actualValue, notes })).unwrap();
    }, [dispatch, id]);
    
    useEffect(() => {
        if (id) {
            loadActual();
        }
    }, [id, loadActual]);
    
    return {
        actual,
        loading,
        error,
        update,
        submit,
        approve,
        reject,
        resubmit,
        refresh: loadActual,
    };
};

export default useActual;