import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pending: {
        items: [],
        loading: false,
        error: null,
        counts: {
            total: 0,
            overdue: 0,
        },
    },
    history: {
        items: [],
        pagination: {
            count: 0,
            next: null,
            previous: null,
        },
        loading: false,
    },
    escalations: {
        items: [],
        myEscalations: [],
        loading: false,
        error: null,
    },
    rejectionReasons: {
        items: [],
        loading: false,
    },
    current: {
        validation: null,
        loading: false,
    },
};
const validationSlice = createSlice({
    name: 'validation',
    initialState,
    reducers: {
        // Pending validations
        fetchPendingStart: (state) => {
            state.pending.loading = true;
            state.pending.error = null;
        },
        fetchPendingSuccess: (state, action) => {
            state.pending.loading = false;
            state.pending.items = action.payload;
            state.pending.counts.total = action.payload.length;
            state.pending.counts.overdue = action.payload.filter(v => {
                const daysPending = (new Date() - new Date(v.submitted_at)) / (1000 * 60 * 60 * 24);
                return daysPending > 3;
            }).length;
        },
        fetchPendingFailure: (state, action) => {
            state.pending.loading = false;
            state.pending.error = action.payload;
        },
        // Validation history
        fetchHistoryStart: (state) => {
            state.history.loading = true;
        },
        fetchHistorySuccess: (state, action) => {
            state.history.loading = false;
            state.history.items = action.payload.results;
            state.history.pagination = {
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
            };
        },
        fetchHistoryFailure: (state) => {
            state.history.loading = false;
        },
        // Escalations
        fetchEscalationsStart: (state) => {
            state.escalations.loading = true;
        },
        fetchEscalationsSuccess: (state, action) => {
            state.escalations.loading = false;
            state.escalations.items = action.payload;
        },
        fetchMyEscalationsSuccess: (state, action) => {
            state.escalations.myEscalations = action.payload;
        },
        fetchEscalationsFailure: (state, action) => {
            state.escalations.loading = false;
            state.escalations.error = action.payload;
        },
        resolveEscalation: (state, action) => {
            const index = state.escalations.items.findIndex(e => e.id === action.payload);
            if (index !== -1) {
                state.escalations.items[index].status = 'RESOLVED';
            }
            const myIndex = state.escalations.myEscalations.findIndex(e => e.id === action.payload);
            if (myIndex !== -1) {
                state.escalations.myEscalations[myIndex].status = 'RESOLVED';
            }
        },
        // Rejection reasons
        fetchRejectionReasonsStart: (state) => {
            state.rejectionReasons.loading = true;
        },
        fetchRejectionReasonsSuccess: (state, action) => {
            state.rejectionReasons.loading = false;
            state.rejectionReasons.items = action.payload;
        },
        fetchRejectionReasonsFailure: (state) => {
            state.rejectionReasons.loading = false;
        },
        // Current validation
        setCurrentValidation: (state, action) => {
            state.current.validation = action.payload;
        },
        clearCurrentValidation: (state) => {
            state.current.validation = null;
        },
        // Actions
        approveValidationOptimistic: (state, action) => {
            const index = state.pending.items.findIndex(v => v.id === action.payload);
            if (index !== -1) {
                state.pending.items.splice(index, 1);
                state.pending.counts.total -= 1;
            }
        },
        rejectValidationOptimistic: (state, action) => {
            const index = state.pending.items.findIndex(v => v.id === action.payload);
            if (index !== -1) {
                state.pending.items.splice(index, 1);
                state.pending.counts.total -= 1;
            }
        },
        escalateValidationOptimistic: (state, action) => {
            const index = state.pending.items.findIndex(v => v.id === action.payload);
            if (index !== -1) {
                state.pending.items.splice(index, 1);
                state.pending.counts.total -= 1;
            }
        },
    },
});
export const {
    fetchPendingStart,
    fetchPendingSuccess,
    fetchPendingFailure,
    fetchHistoryStart,
    fetchHistorySuccess,
    fetchHistoryFailure,
    fetchEscalationsStart,
    fetchEscalationsSuccess,
    fetchMyEscalationsSuccess,
    fetchEscalationsFailure,
    resolveEscalation,
    fetchRejectionReasonsStart,
    fetchRejectionReasonsSuccess,
    fetchRejectionReasonsFailure,
    setCurrentValidation,
    clearCurrentValidation,
    approveValidationOptimistic,
    rejectValidationOptimistic,
    escalateValidationOptimistic,
} = validationSlice.actions;
export default validationSlice.reducer;