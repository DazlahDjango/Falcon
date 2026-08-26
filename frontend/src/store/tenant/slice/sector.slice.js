// store/tenant/sector.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sectorService } from '../../../services/tenant';

const initialState = {
    sectors: [],
    currentSector: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    toggleResult: null,
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    },
    filters: {
        sector_type: null,
        is_active: null,
        search: '',
    },
};

export const fetchSectors = createAsyncThunk(
    'sector/fetchSectors',
    async (params = {}, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const currentPagination = state.sector?.pagination || { page: 1, pageSize: 20 };
            const page = params.page || currentPagination.page || 1;
            const pageSize = params.pageSize || params.page_size || currentPagination.pageSize || 20;
            const limit = pageSize;
            const offset = (page - 1) * pageSize;

            const queryParams = { limit, offset, page, page_size: pageSize, ...params };
            const response = await sectorService.getSectors(queryParams);
            const data = response?.data || response;

            let result;
            if (Array.isArray(data)) {
                result = { results: data, count: data.length };
            } else if (data?.results) {
                result = data;
            } else {
                result = { results: [data], count: 1 };
            }

            return { data: result, page, pageSize };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchSector = createAsyncThunk(
    'sector/fetchSector',
    async (id, { rejectWithValue }) => {
        try {
            const response = await sectorService.getSector(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createSector = createAsyncThunk(
    'sector/createSector',
    async (data, { rejectWithValue }) => {
        try {
            const response = await sectorService.createSector(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateSector = createAsyncThunk(
    'sector/updateSector',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await sectorService.updateSector(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteSector = createAsyncThunk(
    'sector/deleteSector',
    async (id, { rejectWithValue }) => {
        try {
            await sectorService.deleteSector(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const toggleSectorActive = createAsyncThunk(
    'sector/toggleSectorActive',
    async (id, { rejectWithValue }) => {
        try {
            const response = await sectorService.toggleActive(id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const sectorSlice = createSlice({
    name: 'sector',
    initialState,
    reducers: {
        clearCurrentSector: (state) => {
            state.currentSector = null;
            state.toggleResult = null;
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearAllSectors: (state) => {
            state.sectors = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSectors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.loading = false;
                const { data, page, pageSize } = action.payload || {};
                const payload = data || {};
                const sectorsData = payload.results || payload || [];
                const results = Array.isArray(sectorsData) ? sectorsData : [];
                const total = payload.count !== undefined ? payload.count : results.length;

                state.sectors = results;
                const activePageSize = pageSize || state.pagination.pageSize || 20;
                const activePage = page || state.pagination.page || 1;
                const totalPages = Math.max(1, Math.ceil(total / activePageSize));

                state.pagination = {
                    page: activePage,
                    pageSize: activePageSize,
                    total,
                    totalPages,
                };
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSector.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchSector.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentSector = action.payload;
            })
            .addCase(fetchSector.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createSector.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createSector.fulfilled, (state, action) => {
                state.submitting = false;
                state.sectors.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createSector.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateSector.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateSector.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentSector = action.payload;
                const index = state.sectors.findIndex(s => s.id === action.payload.id);
                if (index !== -1) state.sectors[index] = action.payload;
            })
            .addCase(updateSector.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteSector.fulfilled, (state, action) => {
                state.sectors = state.sectors.filter(s => s.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(toggleSectorActive.fulfilled, (state, action) => {
                state.toggleResult = action.payload;
                const sector = action.payload.data;
                if (sector) {
                    const index = state.sectors.findIndex(s => s.id === sector.id);
                    if (index !== -1) state.sectors[index] = sector;
                    if (state.currentSector?.id === sector.id) {
                        state.currentSector = sector;
                    }
                }
            });
    },
});

export const {
    clearCurrentSector,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllSectors,
} = sectorSlice.actions;

export default sectorSlice.reducer;