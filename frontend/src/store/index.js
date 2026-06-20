// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';
import kpiModuleReducer from './kpi/index';
// Accounts Middlewares
import { authMiddleware } from './accounts/middlewares/authMiddleware';
import { loggerMiddleware } from './middleware';
// Tenant Middlewares
import { tenantMiddlewares } from './tenant/middleware';
// Billing
import { billingMiddlewares } from './billing/middleware';

import { backupMiddleware, maintenanceMiddleware } from './config';
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'tenant', 'appTenant', 'theme', 'organisation', 'subscription', 'tenantDomain', 'tenantBackup'],
    blacklist: [
        'ui',
        'notifications',
        'audit',
        'kpi',
        'departments',
        'teams',
        'positions',
        'domains',
        'branding',
        'settings',
        'users',
        'tenantUI',
        'tenantAudit',
        'billing'
    ],
    transforms: [
        encryptTransform({
            secretKey: import.meta.env.VITE_STORAGE_ENCRYPT_KEY || 'falcon-pms-secret-key',
            onError: (error) => {
                console.error('Storage encryption error:', error);
            }
        })
    ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const appReducer = (state, action) => {
  // If we are on a KPI page, we want to make sure the KPI reducer is active
  const newState = persistedReducer(state, action);
  
  // Force injection of KPI reducer if it's missing but we have a kpiModuleReducer
  if (state && !newState.kpi && kpiModuleReducer) {
    return {
      ...newState,
      kpi: kpiModuleReducer(state.kpi, action)
    };
  }
  
  return newState;
};

export const store = configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST', 'persist/REHYDRATE',
                    'websocket/message',
                    'websocket/connect',
                    'websocket/disconnect'
                ],
                ignoredActionPaths: [
                    'payload.action',
                    'payload.config',
                    'payload.request',
                    'payload.headers',
                    'payload.originalArgs',
                    // WebSocket payload paths
                    'payload.data.raw_payload',
                    'payload.raw_payload'
                ],
                ignoredPaths: [
                    'notifications.socket',
                    'ui.notifications',
                    'kpi.detail.loading',
                    'kpi.list.loading',
                    'actual.detail.loading',
                    // WebSocket paths
                    'billing.checkout.currentCheckout',
                    'billing.webhooks.lastMessage'
                ]
            },
            thunk: {
                extraArgument: {}
            }
        }).concat(
            authMiddleware,
            loggerMiddleware,
            ...tenantMiddlewares,
            backupMiddleware,
            maintenanceMiddleware,
            ...billingMiddlewares
        ),
    devTools: import.meta.env.MODE !== 'production'
});

export const persistor = persistStore(store);
export const selectRootState = (state) => state;
export default store;