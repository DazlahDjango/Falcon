/**
 * Hook for cascading targets
 */
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    cascadeToDepartment,
    getCascadeTree,
    selectTargetLoading
} from '../../store/kpi';

const useTargetCascade = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [cascadeTree, setCascadeTree] = useState(null);
    const [error, setError] = useState(null);
    
    const cascadeToDept = useCallback(async (deptTargetId, ruleId, userIds = [], weights = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(cascadeToDepartment({
                deptTargetId,
                ruleId,
                userIds,
                weights
            })).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    const loadCascadeTree = useCallback(async (orgTargetId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(getCascadeTree(orgTargetId)).unwrap();
            setCascadeTree(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);
    
    return {
        cascadeToDepartment: cascadeToDept,
        loadCascadeTree,
        cascadeTree,
        loading,
        error,
    };
};

export default useTargetCascade;