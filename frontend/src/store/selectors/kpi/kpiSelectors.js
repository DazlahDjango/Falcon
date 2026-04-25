import { createSelector } from "@reduxjs/toolkit";

// Base selectors
const selectKpiState = (state) => state.kpi;
const selectKpiListState = (state) => state.kpi.list;
const selectKpiDetailState = (state) => state.kpi.detail;
const selectKpiWeightsState = (state) => state.kpi.weights;
const selectKpiFilters = (state) => state.kpi.list.filters;
// List selectors
export const selectKPIs = createSelector(
    [selectKpiListState],
    (list) => list.items
);
export const selectKPIsLoading = createSelector(
    [selectKpiListState],
    (list) => list.loading
);
export const selectKPIsError = createSelector(
    [selectKpiListState],
    (list) => list.error
);
export const selectKPIPagination = createSelector(
    [selectKpiListState],
    (list) => list.pagination
);
export const selectKPIListFilters = createSelector(
    [selectKpiFilters],
    (filters) => filters
);
export const selectFilteredKPIs = createSelector(
    [selectKPIs, selectKPIListFilters],
    (kpis, filters) => {
        let filtered = [...kpis];
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(k => 
                k.name.toLowerCase().includes(searchLower) ||
                k.code.toLowerCase().includes(searchLower)
            );
        }
        
        if (filters.kpiType) {
            filtered = filtered.filter(k => k.kpiType === filters.kpiType);
        }
        
        if (filters.isActive !== undefined) {
            filtered = filtered.filter(k => k.isActive === filters.isActive);
        }
        
        return filtered;
    }
);
// Detail selectors
export const selectCurrentKPI = createSelector(
    [selectKpiDetailState],
    (detail) => detail.item
);
export const selectKPIDetailLoading = createSelector(
    [selectKpiDetailState],
    (detail) => detail.loading
);
export const selectKPIDetailError = createSelector(
    [selectKpiDetailState],
    (detail) => detail.error
);
// Weights selectors
export const selectKPIWeights = createSelector(
    [selectKpiWeightsState],
    (weights) => weights.items
);
export const selectKPIWeightsLoading = createSelector(
    [selectKpiWeightsState],
    (weights) => weights.loading
);
// Computed selectors
export const selectKPIByCode = (code) => createSelector(
    [selectKPIs],
    (kpis) => kpis.find(k => k.code === code)
);
export const selectKPIById = (id) => createSelector(
    [selectKPIs],
    (kpis) => kpis.find(k => k.id === id)
);
export const selectActiveKPIs = createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.isActive)
);
export const selectKPIsByType = (type) => createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.kpiType === type)
);
export const selectKPIsByFramework = (frameworkId) => createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.frameworkId === frameworkId)
);
export const selectKPIsByOwner = (ownerId) => createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.ownerId === ownerId)
);
export const selectKPIsByCategory = (categoryId) => createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.categoryId === categoryId)
);
export const selectKPIsBySector = (sectorId) => createSelector(
    [selectKPIs],
    (kpis) => kpis.filter(k => k.sectorId === sectorId)
);
export const selectKPIStatistics = createSelector(
    [selectKPIs],
    (kpis) => ({
        total: kpis.length,
        active: kpis.filter(k => k.isActive).length,
        inactive: kpis.filter(k => !k.isActive).length,
        byType: kpis.reduce((acc, k) => {
            acc[k.kpiType] = (acc[k.kpiType] || 0) + 1;
            return acc;
        }, {}),
        byStatus: {
            active: kpis.filter(k => k.isActive).length,
            inactive: kpis.filter(k => !k.isActive).length,
        }
    })
);
export const selectWeightTotalForKPI = (kpiId) => createSelector(
    [selectKPIWeights],
    (weights) => {
        const kpiWeights = weights.filter(w => w.kpiId === kpiId);
        return kpiWeights.reduce((sum, w) => sum + w.weight, 0);
    }
);
export const selectIsWeightValid = (kpiId) => createSelector(
    [selectWeightTotalForKPI(kpiId)],
    (total) => Math.abs(total - 100) < 0.01
);