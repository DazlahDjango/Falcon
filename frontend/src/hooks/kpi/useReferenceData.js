import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

export const useKpiReferenceData = (include = 'users,departments') => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/kpis/reference-data/', {
                params: { include },
            });
            setUsers(res.data?.users ?? []);
            setDepartments(res.data?.departments ?? []);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load reference data');
        } finally {
            setIsLoading(false);
        }
    }, [include]);

    useEffect(() => {
        load();
    }, [load]);

    return { users, departments, isLoading, error, reload: load };
};
