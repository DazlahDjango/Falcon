import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';
// Middlewares
import { authMiddleware } from './accounts/middlewares/authMiddleware';
import { loggerMiddleware } from './accounts/middlewares/loggerMiddleware';
import { auditMiddleware } from './organisation/middlewares/auditMiddleware';
import { syncMiddleware } from './organisation/middlewares/syncMiddleware';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'tenant', 'theme', 'organisation', 'subscription'],
    blacklist: ['ui', 'notifications', 'audit', 'kpi', 'departments', 'teams', 'positions', 'domains', 'branding', 'settings', 'users'],
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
                ignoredActionPaths: ['payload.action'],
                ignoredPaths: ['notifications.socket', 'ui.notifications']
            },
            thunk: {
                extraArgument: {}
            }
        }).concat(authMiddleware, loggerMiddleware, auditMiddleware, syncMiddleware),
    devTools: import.meta.env.MODE !== 'production'
});

export const persistor = persistStore(store);
export const selectRootState = (state) => state;
export default store;