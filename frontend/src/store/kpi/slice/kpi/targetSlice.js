import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    list: {
        items: [],
        pagination: {
            count: 0,
            next: null,
            previous: null,
        },
        filters: {
            year: new Date().getFullYear(),
            user: '',
            kpi: '',
        },
        loading: false,
        error: null,
    },
    detail: {
        item: null,
        loading: false,
        error: null,
    },
    phasing: {
        items: [],
        loading: false,
        isLocked: false,
    },
    cascade: {
        maps: [],
        rules: [],
        loading: false,
        tree: null,
    },
};
const targetSlice = createSlice({
    name: 'target',
    initialState,
    reducers: {
        // List actions
        fetchTargetsStart: (state) => {
            state.list.loading = true;
            state.list.error = null;
        },
        fetchTargetsSuccess: (state, action) => {
            state.list.loading = false;
            state.list.items = action.payload.results;
            state.list.pagination = {
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
            };
        },
        fetchTargetsFailure: (state, action) => {
            state.list.loading = false;
            state.list.error = action.payload;
        },
        // Detail actions
        fetchTargetDetailStart: (state) => {
            state.detail.loading = true;
        },
        fetchTargetDetailSuccess: (state, action) => {
            state.detail.loading = false;
            state.detail.item = action.payload;
        },
        fetchTargetDetailFailure: (state, action) => {
            state.detail.loading = false;
            state.detail.error = action.payload;
        },
        // Filters
        setTargetFilters: (state, action) => {
            state.list.filters = { ...state.list.filters, ...action.payload };
        },
        clearTargetFilters: (state) => {
            state.list.filters = initialState.list.filters;
        },
        // Phasing
        fetchPhasingStart: (state) => {
            state.phasing.loading = true;
        },
        fetchPhasingSuccess: (state, action) => {
            state.phasing.loading = false;
            state.phasing.items = action.payload;
            state.phasing.isLocked = action.payload.some(p => p.is_locked);
        },
        fetchPhasingFailure: (state) => {
            state.phasing.loading = false;
        },
        updatePhasing: (state, action) => {
            state.phasing.items = action.payload;
        },
        lockPhasing: (state) => {
            state.phasing.isLocked = true;
            state.phasing.items = state.phasing.items.map(p => ({ ...p, is_locked: true }));
        },
        // Cascade
        fetchCascadeMapsStart: (state) => {
            state.cascade.loading = true;
        },
        fetchCascadeMapsSuccess: (state, action) => {
            state.cascade.loading = false;
            state.cascade.maps = action.payload;
        },
        fetchCascadeRulesSuccess: (state, action) => {
            state.cascade.rules = action.payload;
        },
        setCascadeTree: (state, action) => {
            state.cascade.tree = action.payload;
        },
        cascadeFailure: (state) => {
            state.cascade.loading = false;
        },
        // Mutations
        createTargetSuccess: (state, action) => {
            state.list.items.unshift(action.payload);
            state.list.pagination.count += 1;
        },
        updateTargetSuccess: (state, action) => {
            const index = state.list.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list.items[index] = action.payload;
            }
            if (state.detail.item?.id === action.payload.id) {
                state.detail.item = action.payload;
            }
        },
        deleteTargetSuccess: (state, action) => {
            state.list.items = state.list.items.filter(item => item.id !== action.payload);
            state.list.pagination.count -= 1
        },
    },
});
export const {
    fetchTargetsStart,
    fetchTargetsSuccess,
    fetchTargetsFailure,
    fetchTargetDetailStart,
    fetchTargetDetailSuccess,
    fetchTargetDetailFailure,
    setTargetFilters,
    clearTargetFilters,
    fetchPhasingStart,
    fetchPhasingSuccess,
    fetchPhasingFailure,
    updatePhasing,
    lockPhasing,
    fetchCascadeMapsStart,
    fetchCascadeMapsSuccess,
    fetchCascadeRulesSuccess,
    setCascadeTree,
    cascadeFailure,
    createTargetSuccess,
    updateTargetSuccess,
    deleteTargetSuccess,
} = targetSlice.actions;
export default targetSlice.reducer;