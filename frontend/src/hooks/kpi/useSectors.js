import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSectors,
    createSector,
    updateSector,
    deleteSector,
    selectSectors,
    selectFrameworkLoading,
    selectFrameworkError
} from '../../store/kpi';

const useSectors = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const sectors = useSelector(selectSectors);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    const loadSectors = useCallback((params = {}) => {
        dispatch(fetchSectors(params));
    }, [dispatch]);
    
    const create = useCallback(async (data) => {
        return dispatch(createSector(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback(async (id, data) => {
        return dispatch(updateSector({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteSector(id)).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadSectors(initialParams);
    }, [loadSectors, initialParams]);
    
    return {
        sectors,
        loading,
        error,
        create,
        update,
        delete: remove,
        refresh: () => loadSectors(initialParams),
    };
};

export default useSectors;