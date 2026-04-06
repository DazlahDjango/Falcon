import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import rootReducer from './rootReducer';
import { authMiddleware } from './accounts/middlewares/authMiddleware';
import { loggerMiddleware } from './accounts/middlewares/loggerMiddleware';


const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'tenant', 'theme'],
    blacklist: ['ui', 'notifications'],
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
                ignoredActionsPaths: ['payload.action'],
                ignoredPaths: ['notifications.socket']
            },
            thunk: {
                extraArgument: {}
            }
        }).concat(authMiddleware, loggerMiddleware),
    devTools: import.meta.env.MODE !== 'production'
});
export const persistor = persistStore(store);
export const selectRootState = (state) => state;
export default store;