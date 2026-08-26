import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'system',
  sidebarOpen: true,
  sidebarCollapsed: false,
  isMobile: window.innerWidth <= 768,
  screenSize: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  activeModal: null,
  notificationsEnabled: true,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    setScreenSize(state, action) {
      state.screenSize = action.payload;
      state.isMobile = action.payload.width <= 768;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setSidebarCollapsed,
  setScreenSize,
  openModal,
  closeModal,
} = globalSlice.actions;

export default globalSlice.reducer;
