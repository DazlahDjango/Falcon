import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createAdjustment,
    approveAdjustment,
    selectAdjustments,
    selectActualLoading,
    selectActualError
} from '../../store/kpi';

const useActualAdjustments = () => {
    const dispatch = useDispatch();
    
    const adjustments = useSelector(selectAdjustments);
    const loading = useSelector(selectActualLoading);
    const error = useSelector(selectActualError);
    
    const request = useCallback(async (originalActualId, adjustedValue, reason) => {
        return dispatch(createAdjustment({ originalActualId, adjustedValue, reason })).unwrap();
    }, [dispatch]);
    
    const approve = useCallback(async (id) => {
        return dispatch(approveAdjustment(id)).unwrap();
    }, [dispatch]);
    
    return {
        adjustments,
        loading,
        error,
        request,
        approve,
    };
};

export default useActualAdjustments;