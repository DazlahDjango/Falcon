// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';

import { authMiddleware } from './accounts/middlewares/authMiddleware';
import { errorHandlerMiddleware, networkErrorMiddleware, retryMiddleware } from './accounts/middlewares/errorMiddleware';
import { loggerMiddleware } from './middleware';

// WebSocket Middlewares
import { accountsWebsocketMiddleware } from './accounts/middlewares/websocketMiddleware';
import { tenantWebsocketMiddleware } from './tenant/middleware/websocketMiddleware';
import { billingWebsocketMiddleware } from './billing/middleware/websocketMiddleware';
import { structureWebsocketMiddleware } from './structure/middleware/websocketMiddleware';
import { kpiWebsocketMiddleware } from './kpi/middleware/websocketMiddleware';
import { configWebsocketMiddleware } from './config/middleware/websocketMiddleware';
import { dashboardWebsocketMiddleware } from './dashboard/middleware/dashboardWebsocket';
import { reportWebSocketMiddleware } from './reports/middleware/reportWebSocket.middleware';
import { websocketMiddleware as reviewsWebsocketMiddleware } from './reviews/middleware/websocketMiddleware';

// Tenant & Billing Middlewares
import { tenantMiddlewares } from './tenant/middleware';
import { billingMiddlewares } from './billing/middleware';
import { backupMiddleware, maintenanceMiddleware } from './config';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: [
        'auth',
        'tenant',
        'appTenant',
        'theme',
        'organisation',
        'subscription',
        'tenantDomain',
        'tenantBackup',
        'reviews',
        'structure'
    ],
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
        'billing',
        'structNotifications',
        'kpis'
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
    const newState = persistedReducer(state, action);
    return newState;
};

export const store = configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/PURGE',
                    'persist/REGISTER',
                    'persist/FLUSH',
                    'persist/PAUSE',
                    'websocket/message',
                    'websocket/connect',
                    'websocket/disconnect',
                    'profiles/uploadAvatar/pending',
                    'profiles/uploadAvatar/fulfilled',
                    'profiles/uploadAvatar/rejected'
                ],
                ignoredActionPaths: [
                    'payload.action',
                    'payload.config',
                    'payload.request',
                    'payload.headers',
                    'payload.originalArgs',
                    'payload.data.raw_payload',
                    'payload.raw_payload',
                    'meta.arg.file'
                ],
                ignoredPaths: [
                    'notifications.socket',
                    'ui.notifications',
                    'kpi.detail.loading',
                    'kpi.list.loading',
                    'actual.detail.loading',
                    'billing.checkout.currentCheckout',
                    'billing.webhooks.lastMessage'
                ]
            },
            thunk: {
                extraArgument: {}
            }
        }).concat(
            authMiddleware,
            errorHandlerMiddleware,
            networkErrorMiddleware,
            retryMiddleware,
            loggerMiddleware,
            accountsWebsocketMiddleware,
            tenantWebsocketMiddleware,
            billingWebsocketMiddleware,
            structureWebsocketMiddleware,
            kpiWebsocketMiddleware,
            configWebsocketMiddleware,
            dashboardWebsocketMiddleware,
            reportWebSocketMiddleware,
            reviewsWebsocketMiddleware,
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