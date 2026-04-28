const PERSIST_KEYS = {
    AUTH: 'auth',
    UI: 'ui',
    NOTIFICATIONS: 'notifications',
    DASHBOARD: 'dashboard',
};
const persistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();

    // Save to localStorage after action
    setTimeout(() => {
        try {
            // Persist auth state
            if (state.auth) {
                const authState = {
                    user: state.auth.user,
                    isAuthenticated: state.auth.isAuthenticated,
                };
                localStorage.setItem(PERSIST_KEYS.AUTH, JSON.stringify(authState));
            }

            // Persist UI state
            if (state.ui) {
                const uiState = {
                    theme: state.ui.theme,
                    sidebarOpen: state.ui.sidebarOpen,
                };
                localStorage.setItem(PERSIST_KEYS.UI, JSON.stringify(uiState));
            }

            // Persist notification settings
            if (state.notifications?.settings) {
                localStorage.setItem(PERSIST_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications.settings));
            }

            // Persist dashboard period
            if (state.dashboard?.period) {
                localStorage.setItem(PERSIST_KEYS.DASHBOARD, JSON.stringify(state.dashboard.period));
            }
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }, 0);

    return result;
};

export default persistMiddleware;