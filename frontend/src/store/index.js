// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';

// Accounts Middlewares
import { authMiddleware } from './accounts/middlewares/authMiddleware';
import { loggerMiddleware } from './accounts/middlewares/loggerMiddleware';

// Tenant Middlewares
import { tenantMiddlewares } from './tenant/middleware';

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
        'tenantAudit'
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

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredActionPaths: [
                    'payload.action',
                    'payload.config',
                    'payload.request',
                    'payload.headers',
                    'payload.originalArgs'
                ],
                ignoredPaths: [
                    'notifications.socket',
                    'ui.notifications',
                    'kpi.detail.loading',
                    'kpi.list.loading',
                    'actual.detail.loading'
                ]
            },
            thunk: {
                extraArgument: {}
            }
        }).concat(
            authMiddleware,
            loggerMiddleware,
            ...tenantMiddlewares  // ← Tenant middleware added here
        ),
    devTools: import.meta.env.MODE !== 'production'
});

export const persistor = persistStore(store);
export const selectRootState = (state) => state;
export default store;