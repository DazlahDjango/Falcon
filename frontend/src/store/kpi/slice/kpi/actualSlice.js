import { createSlice } from '@reduxjs/toolkit';

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
            month: new Date().getMonth() + 1,
            kpi: '',
            user: '',
            status: '',
        },
        loading: false,
        error: null,
    },
    detail: {
        item: null,
        loading: false,
        error: null,
    },
    evidence: {
        items: [],
        loading: false,
    },
    adjustments: {
        items: [],
        loading: false,
    },
    entry: {
        submitting: false,
        error: null,
    },
};
const actualSlice = createSlice({
    name: 'actual',
    initialState,
    reducers: {
        // List actions
        fetchActualsStart: (state) => {
            state.list.loading = true;
            state.list.error = null;
        },
        fetchActualsSuccess: (state, action) => {
            state.list.loading = false;
            state.list.items = action.payload.results;
            state.list.pagination = {
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
            };
        },
        fetchActualsFailure: (state, action) => {
            state.list.loading = false;
            state.list.error = action.payload;
        },
        // Detail actions
        fetchActualDetailStart: (state) => {
            state.detail.loading = true;
        },
        fetchActualDetailSuccess: (state, action) => {
            state.detail.loading = false;
            state.detail.item = action.payload;
        },
        fetchActualDetailFailure: (state, action) => {
            state.detail.loading = false;
            state.detail.error = action.payload;
        },
        clearActualDetail: (state) => {
            state.detail.item = null;
        },
        // Filters
        setActualFilters: (state, action) => {
            state.list.filters = { ...state.list.filters, ...action.payload };
        },
        clearActualFilters: (state) => {
            state.list.filters = initialState.list.filters;
        },
        // Evidence
        fetchEvidenceStart: (state) => {
            state.evidence.loading = true;
        },
        fetchEvidenceSuccess: (state, action) => {
            state.evidence.loading = false;
            state.evidence.items = action.payload;
        },
        fetchEvidenceFailure: (state) => {
            state.evidence.loading = false;
        },
        addEvidence: (state, action) => {
            state.evidence.items.push(action.payload);
        },
        removeEvidence: (state, action) => {
            state.evidence.items = state.evidence.items.filter(e => e.id !== action.payload);
        },
        // Adjustments
        fetchAdjustmentsStart: (state) => {
            state.adjustments.loading = true;
        },
        fetchAdjustmentsSuccess: (state, action) => {
            state.adjustments.loading = false;
            state.adjustments.items = action.payload;
        },
        fetchAdjustmentsFailure: (state) => {
            state.adjustments.loading = false;
        },
        // Entry
        submitActualStart: (state) => {
            state.entry.submitting = true;
            state.entry.error = null;
        },
        submitActualSuccess: (state, action) => {
            state.entry.submitting = false;
            state.list.items.unshift(action.payload);
            state.list.pagination.count += 1;
        },
        submitActualFailure: (state, action) => {
            state.entry.submitting = false;
            state.entry.error = action.payload;
        },
        // Mutations
        updateActualSuccess: (state, action) => {
            const index = state.list.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list.items[index] = action.payload;
            }
            if (state.detail.item?.id === action.payload.id) {
                state.detail.item = action.payload;
            }
        },
        approveActualSuccess: (state, action) => {
            const index = state.list.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list.items[index] = action.payload;
            }
        },
        rejectActualSuccess: (state, action) => {
            const index = state.list.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list.items[index] = action.payload;
            }
        },
    },
});
export const {
    fetchActualsStart,
    fetchActualsSuccess,
    fetchActualsFailure,
    fetchActualDetailStart,
    fetchActualDetailSuccess,
    fetchActualDetailFailure,
    clearActualDetail,
    setActualFilters,
    clearActualFilters,
    fetchEvidenceStart,
    fetchEvidenceSuccess,
    fetchEvidenceFailure,
    addEvidence,
    removeEvidence,
    fetchAdjustmentsStart,
    fetchAdjustmentsSuccess,
    fetchAdjustmentsFailure,
    submitActualStart,
    submitActualSuccess,
    submitActualFailure,
    updateActualSuccess,
    approveActualSuccess,
    rejectActualSuccess,
} = actualSlice.actions;
export default actualSlice.reducer;