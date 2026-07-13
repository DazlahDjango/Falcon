// store/tenant/selectors/sector.selectors.js
import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    sectors: [],
    currentSector: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    toggleResult: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { sector_type: null, is_active: null, search: '' },
};

export const selectSectorState = (state) => {
    const topLevel = state?.sector;
    const nested = state?.tenant?.sector;
    return topLevel || nested || initialState;
};

export const selectSectors = createSelector(
    [selectSectorState],
    (state) => {
        console.log('🔍 selectSectors called with state:', state);
        console.log('🔍 state.sectors:', state?.sectors);
        return state?.sectors || [];
    }
);

export const selectCurrentSector = createSelector(
    [selectSectorState],
    (state) => state.currentSector || null
);

export const selectSectorLoading = createSelector(
    [selectSectorState],
    (state) => state.loading || false
);

export const selectSectorDetailsLoading = createSelector(
    [selectSectorState],
    (state) => state.loadingDetails || false
);

export const selectSectorSubmitting = createSelector(
    [selectSectorState],
    (state) => state.submitting || false
);

export const selectSectorError = createSelector(
    [selectSectorState],
    (state) => state.error || null
);

export const selectSectorToggleResult = createSelector(
    [selectSectorState],
    (state) => state.toggleResult || null
);

export const selectSectorPagination = createSelector(
    [selectSectorState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectSectorPage = createSelector(
    [selectSectorState],
    (state) => state.pagination?.page || 1
);

export const selectSectorTotal = createSelector(
    [selectSectorState],
    (state) => state.pagination?.total || 0
);

export const selectSectorTotalPages = createSelector(
    [selectSectorPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectSectorFilters = createSelector(
    [selectSectorState],
    (state) => state.filters || { sector_type: null, is_active: null, search: '' }
);

export const selectSectorById = createSelector(
    [selectSectors, (state, id) => id],
    (sectors, id) => sectors.find(s => s.id === id) || null
);

export const selectSectorByCode = createSelector(
    [selectSectors, (state, code) => code],
    (sectors, code) => sectors.find(s => s.code === code) || null
);

export const selectActiveSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.is_active === true)
);

export const selectInactiveSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.is_active === false)
);

export const selectSectorsByType = createSelector(
    [selectSectors, (state, type) => type],
    (sectors, type) => sectors.filter(s => s.sector_type === type)
);

export const selectCommercialSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.sector_type === 'COMMERCIAL')
);

export const selectNgoSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.sector_type === 'NGO')
);

export const selectPublicSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.sector_type === 'PUBLIC')
);

export const selectConsultingSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.filter(s => s.sector_type === 'CONSULTING')
);

export const selectSectorCount = createSelector(
    [selectSectors],
    (sectors) => sectors.length
);

export const selectActiveSectorCount = createSelector(
    [selectActiveSectors],
    (active) => active.length
);

export const selectHasSectors = createSelector(
    [selectSectors],
    (sectors) => sectors.length > 0
);

export const selectIsSectorLoading = createSelector(
    [selectSectorLoading],
    (loading) => loading
);

export const selectHasSectorError = createSelector(
    [selectSectorError],
    (error) => error !== null
);

export const selectSectorOptions = createSelector(
    [selectSectors],
    (sectors) => sectors.map(s => ({
        value: s.id,
        label: s.name,
        code: s.code,
        type: s.sector_type,
        color: s.color,
        icon: s.icon,
    }))
);

export const selectActiveSectorOptions = createSelector(
    [selectActiveSectors],
    (sectors) => sectors.map(s => ({
        value: s.id,
        label: s.name,
        code: s.code,
        type: s.sector_type,
        color: s.color,
        icon: s.icon,
    }))
);

export const selectSectorTypeOptions = createSelector(
    [selectSectors],
    (sectors) => {
        const types = new Set(sectors.map(s => s.sector_type));
        return Array.from(types).map(type => ({
            value: type,
            label: type.charAt(0) + type.slice(1).toLowerCase(),
        }));
    }
);