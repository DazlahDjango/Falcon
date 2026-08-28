import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferenceData, selectReferenceData, selectSettingsLoading } from '../../store/kpi';

const useReferenceData = (include = ['users', 'departments'], autoFetch = true) => {
    const dispatch = useDispatch();
    const [data, setData] = useState({ users: [], departments: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const cachedData = useSelector(selectReferenceData);
    const globalLoading = useSelector(selectSettingsLoading);
    
    // Memoize string key for include array to prevent infinite useEffect loops when inline arrays are passed
    const includeKey = useMemo(() => {
        return Array.isArray(include) ? include.slice().sort().join(',') : String(include || '');
    }, [JSON.stringify(include)]);

    const fetchData = useCallback(async (includeParams) => {
        const params = includeParams || (includeKey ? includeKey.split(',') : ['users', 'departments']);
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(fetchReferenceData(params)).unwrap();
            setData(result);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to fetch reference data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch, includeKey]);
    
    useEffect(() => {
        if (autoFetch && cachedData && (cachedData.users?.length > 0 || cachedData.departments?.length > 0)) {
            setData(cachedData);
        } else if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, cachedData, fetchData]);
    
    // Helper to get user by ID
    const getUserById = useCallback((userId) => {
        return data.users.find(u => u.id === userId);
    }, [data.users]);
    
    // Helper to get department by ID
    const getDepartmentById = useCallback((deptId) => {
        return data.departments.find(d => d.id === deptId);
    }, [data.departments]);
    
    // Helper to get users by role
    const getUsersByRole = useCallback((role) => {
        return data.users.filter(u => u.role === role);
    }, [data.users]);
    
    return {
        users: data.users,
        departments: data.departments,
        referenceData: data,
        loading: loading || globalLoading,
        error,
        refetch: fetchData,
        getUserById,
        getDepartmentById,
        getUsersByRole,
    };
};

export default useReferenceData;