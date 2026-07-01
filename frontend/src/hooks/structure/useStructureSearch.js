import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { structureSearchService } from '../../services/structure';

export const useStructureSearch = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const search = useCallback(async (query, params = {}) => {
        if (!query) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await structureSearchService.search(query, params);
            setResults(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.message || 'Search failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchOrganizationalUnits = useCallback((query, isActive) => {
        return search(query, { level: 'organizational_unit', is_active: isActive });
    }, [search]);

    const searchDivisions = useCallback((query, isActive) => {
        return search(query, { level: 'division', is_active: isActive });
    }, [search]);

    const searchDepartments = useCallback((query, isActive) => {
        return search(query, { level: 'department', is_active: isActive });
    }, [search]);

    const searchSections = useCallback((query, isActive) => {
        return search(query, { level: 'section', is_active: isActive });
    }, [search]);

    const searchUnits = useCallback((query, isActive) => {
        return search(query, { level: 'unit', is_active: isActive });
    }, [search]);

    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
    }, []);

    return {
        results,
        isLoading,
        error,
        search,
        searchOrganizationalUnits,
        searchDivisions,
        searchDepartments,
        searchSections,
        searchUnits,
        clearResults,
    };
};

export default useStructureSearch;