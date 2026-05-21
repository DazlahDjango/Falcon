export const selectSecurityBanner = (state) => state.accountsSecurity?.banner;
export const selectSecurityWsConnected = (state) => state.accountsSecurity?.wsConnected ?? false;
export const selectSecurityLastEvent = (state) => state.accountsSecurity?.lastEvent;
