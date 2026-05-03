// frontend/src/store/tenant/slice/tenantDomainSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DomainService } from '../../../services/tenant';

// Async Thunks
export const fetchDomains = createAsyncThunk(
    'tenantDomain/fetchDomains',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await DomainService.getDomains(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addDomain = createAsyncThunk(
    'tenantDomain/addDomain',
    async ({ tenantId, data }, { rejectWithValue }) => {
        try {
            const response = await DomainService.createDomainForTenant(tenantId, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteDomain = createAsyncThunk(
    'tenantDomain/deleteDomain',
    async ({ tenantId, domainId }, { rejectWithValue }) => {
        try {
            await DomainService.deleteDomainForTenant(tenantId, domainId);
            return domainId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const verifyDomain = createAsyncThunk(
    'tenantDomain/verifyDomain',
    async ({ tenantId, domainId }, { rejectWithValue }) => {
        try {
            const response = await DomainService.verifyDomainForTenant(tenantId, domainId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const setPrimaryDomain = createAsyncThunk(
    'tenantDomain/setPrimaryDomain',
    async ({ tenantId, domainId }, { rejectWithValue }) => {
        try {
            const response = await DomainService.setPrimaryDomainForTenant(tenantId, domainId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    domains: [],
    loading: false,
    error: null,
};

// Slice
const tenantDomainSlice = createSlice({
    name: 'tenantDomain',
    initialState,
    reducers: {
        clearDomainError: (state) => {
            state.error = null;
        },
        clearDomains: (state) => {
            state.domains = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Domains
            .addCase(fetchDomains.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDomains.fulfilled, (state, action) => {
                state.loading = false;
                state.domains = action.payload.results || action.payload;
            })
            .addCase(fetchDomains.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Domain
            .addCase(addDomain.fulfilled, (state, action) => {
                state.domains.push(action.payload);
            })
            // Delete Domain
            .addCase(deleteDomain.fulfilled, (state, action) => {
                state.domains = state.domains.filter(d => d.id !== action.payload);
            })
            // Verify Domain
            .addCase(verifyDomain.fulfilled, (state, action) => {
                const index = state.domains.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.domains[index] = action.payload;
                }
            })
            // Set Primary Domain
            .addCase(setPrimaryDomain.fulfilled, (state, action) => {
                state.domains = state.domains.map(d => ({
                    ...d,
                    is_primary: d.id === action.payload.id
                }));
            });
    },
});

export const { clearDomainError, clearDomains } = tenantDomainSlice.actions;
export default tenantDomainSlice.reducer;