import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useStructureFilters = (initialFilters = {}, paramPrefix = 'filter') => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [localFilters, setLocalFilters] = useState(initialFilters);

    const filters = useMemo(() => {
        const urlFilters = {};
        for (const [key, value] of searchParams.entries()) {
            if (key.startsWith(paramPrefix)) {
                const filterKey = key.replace(`${paramPrefix}_`, '');
                urlFilters[filterKey] = value;
            }
        }
        return { ...localFilters, ...urlFilters };
    }, [searchParams, localFilters, paramPrefix]);

    const setFilter = useCallback((key, value) => {
        let processedValue = value;
        if (value === 'true') processedValue = true;
        if (value === 'false') processedValue = false;
        if (value === 'null' || value === 'undefined') processedValue = '';

        setLocalFilters(prev => ({ ...prev, [key]: processedValue }));

        const newSearchParams = new URLSearchParams(searchParams);
        if (processedValue === undefined || processedValue === null || processedValue === '' || processedValue === false) {
            newSearchParams.delete(`${paramPrefix}_${key}`);
        } else {
            newSearchParams.set(`${paramPrefix}_${key}`, String(processedValue));
        }
        setSearchParams(newSearchParams, { replace: true });
    }, [searchParams, setSearchParams, paramPrefix]);

    const setFilters = useCallback((newFilters) => {
        const processedFilters = {};
        Object.entries(newFilters).forEach(([key, value]) => {
            let processedValue = value;
            if (value === 'true') processedValue = true;
            if (value === 'false') processedValue = false;
            if (value === 'null' || value === 'undefined') processedValue = '';
            processedFilters[key] = processedValue;
        });

        setLocalFilters(prev => ({ ...prev, ...processedFilters }));

        const newSearchParams = new URLSearchParams(searchParams);
        Object.entries(processedFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === false) {
                newSearchParams.delete(`${paramPrefix}_${key}`);
            } else {
                newSearchParams.set(`${paramPrefix}_${key}`, String(value));
            }
        });
        setSearchParams(newSearchParams, { replace: true });
    }, [searchParams, setSearchParams, paramPrefix]);

    const resetFilters = useCallback(() => {
        const processedInitial = {};
        Object.entries(initialFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                processedInitial[key] = value;
            }
        });

        setLocalFilters(initialFilters);

        const newSearchParams = new URLSearchParams();
        Object.entries(processedInitial).forEach(([key, value]) => {
            newSearchParams.set(`${paramPrefix}_${key}`, String(value));
        });
        setSearchParams(newSearchParams, { replace: true });
    }, [searchParams, setSearchParams, paramPrefix, initialFilters]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(v => {
            if (v === undefined || v === null || v === '') return false;
            if (v === false) return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
        });
    }, [filters]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(v => {
            if (v === undefined || v === null || v === '') return false;
            if (v === false) return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
        }).length;
    }, [filters]);

    return {
        filters,
        setFilter,
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const useDepartmentFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        is_active: '',
        sensitivity_level: '',
        parent_id: '',
    }, 'dept');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setActiveStatus: (value) => setFilter('is_active', value),
        setSensitivity: (value) => setFilter('sensitivity_level', value),
        setParent: (value) => setFilter('parent_id', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const usePositionFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        level: '',
        grade: '',
        is_vacant: '',
        is_single_incumbent: '',
    }, 'pos');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setLevel: (value) => setFilter('level', value),
        setGrade: (value) => setFilter('grade', value),
        setVacantOnly: (value) => setFilter('is_vacant', value),
        setSingleIncumbentOnly: (value) => setFilter('is_single_incumbent', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const useEmploymentFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        employment_type: '',
        department_id: '',
        is_manager: '',
        is_executive: '',
        is_active: 'true',
    }, 'emp');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setEmploymentType: (value) => setFilter('employment_type', value),
        setDepartment: (value) => setFilter('department_id', value),
        setManagerOnly: (value) => setFilter('is_manager', value),
        setExecutiveOnly: (value) => setFilter('is_executive', value),
        setActiveStatus: (value) => setFilter('is_active', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const useCostCenterFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        category: '',
        fiscal_year: '',
        is_active: 'true',
        is_shared: '',
    }, 'cc');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setCategory: (value) => setFilter('category', value),
        setFiscalYear: (value) => setFilter('fiscal_year', value),
        setActiveStatus: (value) => setFilter('is_active', value),
        setSharedOnly: (value) => setFilter('is_shared', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const useLocationFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        type: '',
        country: '',
        is_active: 'true',
        is_headquarters: '',
    }, 'loc');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setType: (value) => setFilter('type', value),
        setCountry: (value) => setFilter('country', value),
        setActiveStatus: (value) => setFilter('is_active', value),
        setHeadquartersOnly: (value) => setFilter('is_headquarters', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export const useHierarchyVersionFilters = () => {
    const { filters, setFilter, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useStructureFilters({
        search: '',
        version_type: '',
        is_current: '',
    }, 'ver');

    return {
        filters,
        setSearch: (value) => setFilter('search', value),
        setVersionType: (value) => setFilter('version_type', value),
        setCurrentOnly: (value) => setFilter('is_current', value),
        setFilters,
        resetFilters,
        hasActiveFilters,
        activeFilterCount,
    };
};

export default {
    useStructureFilters,
    useDepartmentFilters,
    usePositionFilters,
    useEmploymentFilters,
    useCostCenterFilters,
    useLocationFilters,
    useHierarchyVersionFilters,
};