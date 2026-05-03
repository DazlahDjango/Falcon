const PERSIST_KEYS = [
  'ui.theme',
  'ui.sidebarCollapsed',
  'auth.user',
  'structure.ui.selectedItems',
  'structure.ui.activeTab',
  'structure.ui.filters',
];

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  PERSIST_KEYS.forEach(key => {
    const value = getNestedValue(state, key);
    if (value !== undefined) {
      localStorage.setItem(`persist_${key}`, JSON.stringify(value));
    }
  });
  
  return result;
};

export const loadPersistedState = () => {
  const persistedState = {};
  PERSIST_KEYS.forEach(key => {
    const saved = localStorage.getItem(`persist_${key}`);
    if (saved) {
      const keys = key.split('.');
      let current = persistedState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = JSON.parse(saved);
    }
  });
  
  return persistedState;
};

export default persistenceMiddleware;