import { createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

const initialState = {
    list: {
        items: [],
        pagination: {
            count: 0,
            next: null,
            previous: null,
            currentPage: 1,
            pageSize: 20,
        },
        filters: {
            search: '',
            framework: '',
            sector: '',
            isActive: true,
            kpiType: '',
        },
        loading: false,
        error: null,
    },
    detail: {
        item: null,
        loading: false,
        error: null,
    },
    weights: {
        items: [],
        loading: false,
        error: null,
    },
    templates: {
        items: [],
        loading: false,
    },
};

const kpiSlice = createSlice({
    name: 'kpi',
    initialState,
    reducers: {
        // List Actions
        fetchKPIsStart: (state) => {
            state.list.loading = true;
            state.list.error = null;
        },
        fetchKPIsSuccess:(state, action) => {
            state.list.loading = false;
            state.list.items = action.payload.results;
            state.list.pagination = {
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
                currentPage: state.list.pagination.currentPage,
                pageSize: state.list.pagination.pageSize,
            };
        },
        fetchKPIsFailure: (state, action) => {
            state.list.loading = false;
            state.list.error = action.payload;
        },
        // Detail Actions
        fetchKPIDetailStart: (state) => {
            state.detail.loading = true;
            state.detail.error = null;
        },
        fetchKPIDetailSuccess: (state, action) => {
            state.detail.loading = false;
            state.detail.item = action.payload;
        },
        fetchKPIDetailFailure: (state, action) => {
            state.detail.loading = false;
            state.detail.error = action.payload;
        },
        clearKPIDetail: (state) => {
            state.detail.item = null;
            state.detail.error = null;
        },
        // Filters
        setKPIFilters: (state, action) => {
            state.list.filters = { ...state.list.filters, ...action.payload };
        },
        clearKPIFilters: (state) => {
            state.list.filters = initialState.list.filters;
        },
        setPage: (state, action) => {
            state.list.pagination.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.list.pagination.pageSize = action.payload;
        },
        // Weights
        fetchWeightsStart: (state) => {
            state.weights.loading = true;
        },
        fetchWeightsSuccess: (state, action) => {
            state.weights.loading = false;
            state.weights.items = action.payload;
        },
        fetchWeightsFailure: (state, action) => {
            state.weights.loading = false;
            state.weights.error = action.payload;
        },
        // Templates
        fetchTemplatesStart: (state) => {
            state.templates.loading = true;
        },
        fetchTemplatesSuccess: (state, action) => {
            state.templates.loading = false;
            state.templates.items = action.payload;
        },
        fetchTemplatesFailure: (state) => {
            state.templates.loading = false;
        },
        // CRUD Mutation
        createKPISuccess: (state, action) => {
            state.list.items.unshift(action.payload);
            state.list.pagination.count += 1;
        },
        updateKPISuccess: (state, action) => {
            const index = state.list.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.list.items[index] = action.payload;
            }
            if (state.detail.item?.id === action.payload.id) {
                state.detail.item = action.payload;
            }
        },
        deleteKPISuccess: (state, action) => {
            state.list.items = state.list.items.filter(item => item.id !== action.payload);
            state.list.pagination.count -= 1;
            if (state.detail.item?.id === action.payload) {
                state.detail.item = null;
            }
        },
    },
});
export const {
    fetchKPIsStart,
    fetchKPIsSuccess,
    fetchKPIsFailure,
    fetchKPIDetailStart,
    fetchKPIDetailSuccess,
    fetchKPIDetailFailure,
    clearKPIDetail,
    setKPIFilters,
    clearKPIFilters,
    setPage,
    setPageSize,
    fetchWeightsStart,
    fetchWeightsSuccess,
    fetchWeightsFailure,
    fetchTemplatesStart,
    fetchTemplatesSuccess,
    fetchTemplatesFailure,
    createKPISuccess,
    updateKPISuccess,
    deleteKPISuccess,
} = kpiSlice.reducer;
export default kpiSlice.reducer;