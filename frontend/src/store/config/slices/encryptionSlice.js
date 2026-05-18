import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  keys: [],
  currentKey: null,
  defaultKey: null,
  keysNeedingRotation: [],
  stats: {
    totalKeys: 0,
    activeKeys: 0,
    compromisedKeys: 0,
    expiredKeys: 0,
    totalUsageCount: 0
  },
  filters: {
    keySource: null,
    keyStatus: null,
    isDefault: null
  },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null
};

const encryptionSlice = createSlice({
  name: 'encryption',
  initialState,
  reducers: {
    setEncryptionKeys: (state, action) => { state.keys = action.payload; },
    setCurrentEncryptionKey: (state, action) => { state.currentKey = action.payload; },
    setDefaultKey: (state, action) => { state.defaultKey = action.payload; },
    setKeysNeedingRotation: (state, action) => { state.keysNeedingRotation = action.payload; },
    setEncryptionStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
    setEncryptionFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setEncryptionPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setEncryptionLoading: (state, action) => { state.loading = action.payload; },
    setEncryptionError: (state, action) => { state.error = action.payload; },
    addEncryptionKey: (state, action) => { state.keys.unshift(action.payload); },
    updateEncryptionKey: (state, action) => {
      const index = state.keys.findIndex(k => k.id === action.payload.id);
      if (index !== -1) state.keys[index] = { ...state.keys[index], ...action.payload };
      if (state.currentKey?.id === action.payload.id) state.currentKey = { ...state.currentKey, ...action.payload };
      if (state.defaultKey?.id === action.payload.id && action.payload.is_default !== undefined) {
        if (action.payload.is_default) state.defaultKey = state.keys[index];
        else if (state.defaultKey?.id === action.payload.id) state.defaultKey = null;
      }
    },
    removeEncryptionKey: (state, action) => { state.keys = state.keys.filter(k => k.id !== action.payload); },
    resetEncryption: () => initialState
  }
});

export const {
  setEncryptionKeys, setCurrentEncryptionKey, setDefaultKey, setKeysNeedingRotation,
  setEncryptionStats, setEncryptionFilters, setEncryptionPagination, setEncryptionLoading,
  setEncryptionError, addEncryptionKey, updateEncryptionKey, removeEncryptionKey, resetEncryption
} = encryptionSlice.actions;
export default encryptionSlice.reducer;