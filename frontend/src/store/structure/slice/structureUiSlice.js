import { createSlice } from '@reduxjs/toolkit';
import { initialStructureUiState } from './structureTypes';

const structureUiSlice = createSlice({
  name: 'structure/ui',
  initialState: initialStructureUiState,
  reducers: {
    // Modal Controls
    openDepartmentModal: (state, action) => {
      state.modals.departmentModal = {
        isOpen: true,
        mode: action.payload?.mode || 'create',
        data: action.payload?.data || null,
      };
    },
    closeDepartmentModal: (state) => {
      state.modals.departmentModal = { isOpen: false, mode: 'create', data: null };
    },
    openTeamModal: (state, action) => {
      state.modals.teamModal = {
        isOpen: true,
        mode: action.payload?.mode || 'create',
        data: action.payload?.data || null,
      };
    },
    closeTeamModal: (state) => {
      state.modals.teamModal = { isOpen: false, mode: 'create', data: null };
    },
    openPositionModal: (state, action) => {
      state.modals.positionModal = {
        isOpen: true,
        mode: action.payload?.mode || 'create',
        data: action.payload?.data || null,
      };
    },
    closePositionModal: (state) => {
      state.modals.positionModal = { isOpen: false, mode: 'create', data: null };
    },
    openEmploymentModal: (state, action) => {
      state.modals.employmentModal = {
        isOpen: true,
        mode: action.payload?.mode || 'create',
        data: action.payload?.data || null,
      };
    },
    closeEmploymentModal: (state) => {
      state.modals.employmentModal = { isOpen: false, mode: 'create', data: null };
    },
    openReportingModal: (state, action) => {
      state.modals.reportingModal = {
        isOpen: true,
        mode: action.payload?.mode || 'create',
        data: action.payload?.data || null,
      };
    },
    closeReportingModal: (state) => {
      state.modals.reportingModal = { isOpen: false, mode: 'create', data: null };
    },
    openConfirmDelete: (state, action) => {
      state.modals.confirmDelete = {
        isOpen: true,
        id: action.payload.id,
        type: action.payload.type,
        name: action.payload.name,
      };
    },
    closeConfirmDelete: (state) => {
      state.modals.confirmDelete = { isOpen: false, id: null, type: null, name: '' };
    },
    openBulkUpload: (state, action) => {
      state.modals.bulkUpload = {
        isOpen: true,
        type: action.payload?.type || 'departments',
      };
    },
    closeBulkUpload: (state) => {
      state.modals.bulkUpload = { isOpen: false, type: null };
    },
    openBulkReassign: (state) => {
      state.modals.bulkReassign = { isOpen: true };
    },
    closeBulkReassign: (state) => {
      state.modals.bulkReassign = { isOpen: false };
    },
    openExportOptions: (state) => {
      state.modals.exportOptions = { isOpen: true };
    },
    closeExportOptions: (state) => {
      state.modals.exportOptions = { isOpen: false };
    },
    openRestoreVersion: (state, action) => {
      state.modals.restoreVersion = {
        isOpen: true,
        version: action.payload?.version || null,
      };
    },
    closeRestoreVersion: (state) => {
      state.modals.restoreVersion = { isOpen: false, version: null };
    },
    openCycleDetection: (state) => {
      state.modals.cycleDetection = { isOpen: true };
    },
    closeCycleDetection: (state) => {
      state.modals.cycleDetection = { isOpen: false };
    },
    // Tab Management
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    // Search
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setIsSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.isSearching = false;
    },
    // Bulk Selection
    addSelectedItem: (state, action) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    removeSelectedItem: (state, action) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    toggleSelectedItem: (state, action) => {
      if (state.selectedItems.includes(action.payload)) {
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
      } else {
        state.selectedItems.push(action.payload);
      }
    },
    selectAllItems: (state, action) => {
      state.selectedItems = [...action.payload];
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    setBulkAction: (state, action) => {
      state.bulkAction = action.payload;
    },
    clearBulkAction: (state) => {
      state.bulkAction = null;
    },
    // Notifications
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    // Reset UI State
    resetStructureUi: () => initialStructureUiState,
  },
});

export const {
  // Modal actions
  openDepartmentModal,
  closeDepartmentModal,
  openTeamModal,
  closeTeamModal,
  openPositionModal,
  closePositionModal,
  openEmploymentModal,
  closeEmploymentModal,
  openReportingModal,
  closeReportingModal,
  openConfirmDelete,
  closeConfirmDelete,
  openBulkUpload,
  closeBulkUpload,
  openBulkReassign,
  closeBulkReassign,
  openExportOptions,
  closeExportOptions,
  openRestoreVersion,
  closeRestoreVersion,
  openCycleDetection,
  closeCycleDetection,
  // Tab actions
  setActiveTab,
  // Search actions
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  clearSearch,
  // Bulk selection actions
  addSelectedItem,
  removeSelectedItem,
  toggleSelectedItem,
  selectAllItems,
  clearSelectedItems,
  setBulkAction,
  clearBulkAction,
  // Notification actions
  setNotification,
  clearNotification,
  // Reset
  resetStructureUi,
} = structureUiSlice.actions;

export default structureUiSlice.reducer;