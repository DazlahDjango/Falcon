import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SubscriptionService } from '../../../services/billing';
import { SUBSCRIPTION_STATUS } from '../../../config/constants/billingConstants';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchCurrentSubscription = createAsyncThunk(
    'billing/subscriptions/fetchCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getCurrentSubscription();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch current subscription');
        }
    }
);

export const fetchSubscriptions = createAsyncThunk(
    'billing/subscriptions/fetchAll',
    async ({ page = 1, pageSize = 20, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getSubscriptions({ page, page_size: pageSize, ...filters });
            return {
                items: response?.data || [],
                total: response?.count || 0,
                page,
                pageSize,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subscriptions');
        }
    }
);

export const fetchSubscriptionById = createAsyncThunk(
    'billing/subscriptions/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await SubscriptionService.getSubscription(id);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subscription');
        }
    }
);

export const createSubscription = createAsyncThunk(
    'billing/subscriptions/create',
    async (subscriptionData, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.createSubscription(subscriptionData);
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create subscription');
        }
    }
);

export const cancelSubscription = createAsyncThunk(
    'billing/subscriptions/cancel',
    async ({ id, atPeriodEnd = true, reason = '' }, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.cancelSubscription(id, { at_period_end: atPeriodEnd, reason });
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to cancel subscription');
        }
    }
);

export const renewSubscription = createAsyncThunk(
    'billing/subscriptions/renew',
    async ({ id, paymentMethodId = null }, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.renewSubscription(id, { payment_method_id: paymentMethodId });
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to renew subscription');
        }
    }
);

export const upgradeSubscription = createAsyncThunk(
    'billing/subscriptions/upgrade',
    async ({ id, planId, immediate = true }, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.upgradeSubscription(id, { plan_id: planId, immediate });
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to upgrade subscription');
        }
    }
);

export const downgradeSubscription = createAsyncThunk(
    'billing/subscriptions/downgrade',
    async ({ id, planId, immediate = false }, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.downgradeSubscription(id, { plan_id: planId, immediate });
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to downgrade subscription');
        }
    }
);

export const updateSubscriptionSettings = createAsyncThunk(
    'billing/subscriptions/updateSettings',
    async ({ id, autoRenew }, { rejectWithValue, dispatch }) => {
        try {
            const response = await SubscriptionService.updateSubscription(id, { auto_renew: autoRenew });
            await dispatch(fetchCurrentSubscription());
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update subscription settings');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    current: null,
    items: [],
    selectedSubscription: null,
    loading: false,
    error: null,
    filters: {
        status: null,
        planType: null,
        activeOnly: false,
    },
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    stats: {
        total: 0,
        active: 0,
        trialing: 0,
        pastDue: 0,
        cancelled: 0,
        expired: 0,
        pendingCancellation: 0,
    },
    lastFetched: null,
};

// ============================================================================
// Slice
// ============================================================================

const subscriptionSlice = createSlice({
    name: 'billing/subscriptions',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearCurrentSubscription: (state) => {
            state.current = null;
        },
        clearSelectedSubscription: (state) => {
            state.selectedSubscription = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateStats: (state) => {
            const items = state.items;
            state.stats = {
                total: items.length,
                active: items.filter(s => s.status === SUBSCRIPTION_STATUS.ACTIVE).length,
                trialing: items.filter(s => s.status === SUBSCRIPTION_STATUS.TRIALING).length,
                pastDue: items.filter(s => s.status === SUBSCRIPTION_STATUS.PAST_DUE).length,
                cancelled: items.filter(s => s.status === SUBSCRIPTION_STATUS.CANCELLED).length,
                expired: items.filter(s => s.status === SUBSCRIPTION_STATUS.EXPIRED).length,
                pendingCancellation: items.filter(s => s.status === SUBSCRIPTION_STATUS.PENDING_CANCELLATION).length,
            };
        },
    },
    extraReducers: (builder) => {
        // Fetch Current Subscription
        builder.addCase(fetchCurrentSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.current = action.payload;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchCurrentSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Subscriptions
        builder.addCase(fetchSubscriptions.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSubscriptions.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.items;
            state.pagination = {
                page: action.payload.page,
                pageSize: action.payload.pageSize,
                total: action.payload.total,
            };
            subscriptionSlice.caseReducers.updateStats(state);
        });
        builder.addCase(fetchSubscriptions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Subscription By ID
        builder.addCase(fetchSubscriptionById.fulfilled, (state, action) => {
            state.selectedSubscription = action.payload;
        });

        // Create Subscription
        builder.addCase(createSubscription.fulfilled, (state, action) => {
            if (action.payload) {
                state.current = action.payload;
            }
        });

        // Cancel Subscription
        builder.addCase(cancelSubscription.fulfilled, (state, action) => {
            if (state.current) {
                state.current = { ...state.current, ...action.payload };
            }
        });

        // Renew Subscription
        builder.addCase(renewSubscription.fulfilled, (state, action) => {
            if (state.current) {
                state.current = { ...state.current, ...action.payload };
            }
        });

        // Upgrade Subscription
        builder.addCase(upgradeSubscription.fulfilled, (state, action) => {
            if (state.current) {
                state.current = { ...state.current, ...action.payload };
            }
        });

        // Downgrade Subscription
        builder.addCase(downgradeSubscription.fulfilled, (state, action) => {
            if (state.current) {
                state.current = { ...state.current, ...action.payload };
            }
        });

        // Update Settings
        builder.addCase(updateSubscriptionSettings.fulfilled, (state, action) => {
            if (state.current) {
                state.current.auto_renew = action.payload.auto_renew;
            }
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setFilters,
    clearFilters,
    setPagination,
    clearCurrentSubscription,
    clearSelectedSubscription,
    clearError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;