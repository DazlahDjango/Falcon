// frontend/src/store/tenant/middleware/tenantMiddleware.js
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
} from '../slice/tenantSlice';
import { showToast } from '../slice/tenantUISlice';

const tenantMiddleware = createListenerMiddleware();

// Listen for successful fetch
tenantMiddleware.startListening({
    actionCreator: fetchTenants.fulfilled,
    effect: (action, listenerApi) => {
        console.log('Tenants fetched successfully:', action.payload);
    },
});

// Listen for create tenant success
tenantMiddleware.startListening({
    actionCreator: createTenant.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: 'Tenant created successfully!',
            type: 'success',
        }));
    },
});

// Listen for create tenant error
tenantMiddleware.startListening({
    actionCreator: createTenant.rejected,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: action.payload || 'Failed to create tenant',
            type: 'error',
        }));
    },
});

// Listen for update tenant success
tenantMiddleware.startListening({
    actionCreator: updateTenant.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: 'Tenant updated successfully!',
            type: 'success',
        }));
    },
});

// Listen for delete tenant success
tenantMiddleware.startListening({
    actionCreator: deleteTenant.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: 'Tenant deleted successfully!',
            type: 'success',
        }));
    },
});

// Listen for suspend tenant success
tenantMiddleware.startListening({
    actionCreator: suspendTenant.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: 'Tenant suspended successfully!',
            type: 'warning',
        }));
    },
});

// Listen for activate tenant success
tenantMiddleware.startListening({
    actionCreator: activateTenant.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(showToast({
            message: 'Tenant activated successfully!',
            type: 'success',
        }));
    },
});

export default tenantMiddleware.middleware;