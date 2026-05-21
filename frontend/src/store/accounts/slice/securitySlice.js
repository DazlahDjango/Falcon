import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wsConnected: false,
    banner: null,
    lastEvent: null,
    forcedLogoutReason: null,
};

const securitySlice = createSlice({
    name: 'accountsSecurity',
    initialState,
    reducers: {
        setSecurityWsConnected: (state, action) => {
            state.wsConnected = action.payload;
        },
        setSecurityBanner: (state, action) => {
            state.banner = action.payload;
        },
        clearSecurityBanner: (state) => {
            state.banner = null;
        },
        setSecurityEvent: (state, action) => {
            state.lastEvent = action.payload;
        },
        setForcedLogoutReason: (state, action) => {
            state.forcedLogoutReason = action.payload;
        },
    },
});

export const {
    setSecurityWsConnected,
    setSecurityBanner,
    clearSecurityBanner,
    setSecurityEvent,
    setForcedLogoutReason,
} = securitySlice.actions;

export default securitySlice.reducer;
