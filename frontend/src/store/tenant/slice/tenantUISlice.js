// frontend/src/store/tenant/slice/tenantUISlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial State
const initialState = {
    // Modal states
    modals: {
        createTenant: false,
        editTenant: false,
        deleteTenant: false,
        suspendTenant: false,
        activateTenant: false,
        upgradeTenant: false,
        inviteUser: false,
        addDomain: false,
        verifyDomain: false,
        deleteDomain: false,
        createBackup: false,
        restoreBackup: false,
        deleteBackup: false,
        viewAuditDetails: false,
        viewMigrationDetails: false,
    },

    // Selected item IDs
    selected: {
        tenantId: null,
        domainId: null,
        backupId: null,
        auditLogId: null,
        migrationId: null,
    },

    // Sidebar state
    sidebar: {
        isOpen: true,
        activeSection: 'overview', // overview, resources, domains, backups, migrations, schema, provisioning, audit, settings
    },

    // Filter drawer
    filterDrawer: {
        isOpen: false,
        filters: {
            status: '',
            subscription_plan: '',
            search: '',
            dateRange: null,
        },
    },

    // View preferences
    viewPreferences: {
        listView: 'table', // table, card, grid
        sortBy: '-created_at',
        itemsPerPage: 20,
    },

    // Notification settings
    notifications: {
        showSuccessToast: true,
        showErrorToast: true,
        showWarningToast: true,
        showInfoToast: true,
    },

    // Toast message state (ADDED)
    toast: null,

    // Loading states for specific actions
    actionLoading: {
        create: false,
        update: false,
        delete: false,
        suspend: false,
        activate: false,
        verify: false,
        restore: false,
    },

    // Error states
    errors: {
        create: null,
        update: null,
        delete: null,
        suspend: null,
        activate: null,
        verify: null,
        restore: null,
    },
};

// Slice
const tenantUISlice = createSlice({
    name: 'tenantUI',
    initialState,
    reducers: {
        // ========== Modal Actions ==========
        openModal: (state, action) => {
            const { modalName, data } = action.payload;
            state.modals[modalName] = true;
            if (data?.id) {
                state.selected[`${modalName.replace('Modal', '')}Id`] = data.id;
            }
            if (data?.extra) {
                state.selected.extra = data.extra;
            }
        },
        closeModal: (state, action) => {
            const modalName = action.payload;
            state.modals[modalName] = false;
            // Clear related selected ID
            const idKey = `${modalName.replace('Modal', '')}Id`;
            if (state.selected[idKey]) {
                state.selected[idKey] = null;
            }
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(key => {
                state.modals[key] = false;
            });
            state.selected = {
                tenantId: null,
                domainId: null,
                backupId: null,
                auditLogId: null,
                migrationId: null,
            };
        },

        // ========== Selection Actions ==========
        setSelectedTenant: (state, action) => {
            state.selected.tenantId = action.payload;
        },
        setSelectedDomain: (state, action) => {
            state.selected.domainId = action.payload;
        },
        setSelectedBackup: (state, action) => {
            state.selected.backupId = action.payload;
        },
        setSelectedAuditLog: (state, action) => {
            state.selected.auditLogId = action.payload;
        },
        setSelectedMigration: (state, action) => {
            state.selected.migrationId = action.payload;
        },
        clearSelected: (state) => {
            state.selected = {
                tenantId: null,
                domainId: null,
                backupId: null,
                auditLogId: null,
                migrationId: null,
            };
        },

        // ========== Sidebar Actions ==========
        toggleSidebar: (state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebar.isOpen = action.payload;
        },
        setActiveSection: (state, action) => {
            state.sidebar.activeSection = action.payload;
        },

        // ========== Filter Drawer Actions ==========
        openFilterDrawer: (state) => {
            state.filterDrawer.isOpen = true;
        },
        closeFilterDrawer: (state) => {
            state.filterDrawer.isOpen = false;
        },
        setFilters: (state, action) => {
            state.filterDrawer.filters = {
                ...state.filterDrawer.filters,
                ...action.payload,
            };
        },
        clearFilters: (state) => {
            state.filterDrawer.filters = {
                status: '',
                subscription_plan: '',
                search: '',
                dateRange: null,
            };
        },
        resetFilters: (state) => {
            state.filterDrawer.filters = initialState.filterDrawer.filters;
            state.filterDrawer.isOpen = false;
        },

        // ========== View Preferences Actions ==========
        setListView: (state, action) => {
            state.viewPreferences.listView = action.payload;
        },
        setSortBy: (state, action) => {
            state.viewPreferences.sortBy = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.viewPreferences.itemsPerPage = action.payload;
        },

        // ========== Notification Actions ==========
        toggleSuccessToast: (state) => {
            state.notifications.showSuccessToast = !state.notifications.showSuccessToast;
        },
        toggleErrorToast: (state) => {
            state.notifications.showErrorToast = !state.notifications.showErrorToast;
        },
        toggleWarningToast: (state) => {
            state.notifications.showWarningToast = !state.notifications.showWarningToast;
        },
        toggleInfoToast: (state) => {
            state.notifications.showInfoToast = !state.notifications.showInfoToast;
        },

        // ========== Toast Actions (ADDED) ==========
        showToast: (state, action) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        },

        // ========== Action Loading States ==========
        setActionLoading: (state, action) => {
            const { actionName, isLoading } = action.payload;
            state.actionLoading[actionName] = isLoading;
        },
        setMultipleActionLoading: (state, action) => {
            const { actions } = action.payload;
            actions.forEach(({ actionName, isLoading }) => {
                state.actionLoading[actionName] = isLoading;
            });
        },
        clearAllActionLoading: (state) => {
            Object.keys(state.actionLoading).forEach(key => {
                state.actionLoading[key] = false;
            });
        },

        // ========== Error Actions ==========
        setActionError: (state, action) => {
            const { actionName, error } = action.payload;
            state.errors[actionName] = error;
        },
        clearActionError: (state, action) => {
            const actionName = action.payload;
            if (actionName) {
                state.errors[actionName] = null;
            }
        },
        clearAllErrors: (state) => {
            Object.keys(state.errors).forEach(key => {
                state.errors[key] = null;
            });
        },

        // ========== Bulk UI Reset ==========
        resetUI: (state) => {
            return initialState;
        },

        // ========== Pagination UI ==========
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.currentPage = 1;
        },
    },
});

// Export actions
export const {
    // Modal actions
    openModal,
    closeModal,
    closeAllModals,

    // Selection actions
    setSelectedTenant,
    setSelectedDomain,
    setSelectedBackup,
    setSelectedAuditLog,
    setSelectedMigration,
    clearSelected,

    // Sidebar actions
    toggleSidebar,
    setSidebarOpen,
    setActiveSection,

    // Filter drawer actions
    openFilterDrawer,
    closeFilterDrawer,
    setFilters,
    clearFilters,
    resetFilters,

    // View preferences
    setListView,
    setSortBy,
    setItemsPerPage,

    // Notification actions
    toggleSuccessToast,
    toggleErrorToast,
    toggleWarningToast,
    toggleInfoToast,

    // Toast actions (ADDED)
    showToast,
    hideToast,

    // Action loading states
    setActionLoading,
    setMultipleActionLoading,
    clearAllActionLoading,

    // Error actions
    setActionError,
    clearActionError,
    clearAllErrors,

    // Bulk reset
    resetUI,

    // Pagination
    setCurrentPage,
    setPageSize,
} = tenantUISlice.actions;

// Selectors
export const selectModalState = (state, modalName) => state.tenantUI.modals[modalName];
export const selectSelectedTenantId = (state) => state.tenantUI.selected.tenantId;
export const selectSelectedDomainId = (state) => state.tenantUI.selected.domainId;
export const selectSelectedBackupId = (state) => state.tenantUI.selected.backupId;
export const selectSidebarOpen = (state) => state.tenantUI.sidebar.isOpen;
export const selectActiveSection = (state) => state.tenantUI.sidebar.activeSection;
export const selectFilterDrawerOpen = (state) => state.tenantUI.filterDrawer.isOpen;
export const selectFilters = (state) => state.tenantUI.filterDrawer.filters;
export const selectListView = (state) => state.tenantUI.viewPreferences.listView;
export const selectSortBy = (state) => state.tenantUI.viewPreferences.sortBy;
export const selectItemsPerPage = (state) => state.tenantUI.viewPreferences.itemsPerPage;
export const selectActionLoading = (state, actionName) => state.tenantUI.actionLoading[actionName];
export const selectActionError = (state, actionName) => state.tenantUI.errors[actionName];
export const selectIsAnyModalOpen = (state) => Object.values(state.tenantUI.modals).some(v => v === true);
export const selectToast = (state) => state.tenantUI.toast; // ADDED

export default tenantUISlice.reducer;