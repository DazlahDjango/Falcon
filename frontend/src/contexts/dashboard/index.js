// frontend/src/contexts/dashboard/index.js

export { DashboardProvider, useDashboard } from './DashboardContext';
export { ExecutiveProvider, useExecutive } from './ExecutiveContext';
export { ClientAdminProvider, useClientAdmin } from './ClientAdminContext';
export { SuperAdminProvider, useSuperAdmin } from './SuperAdminContext';
export { HierarchyProvider, useHierarchy } from './HierarchyContext';
export { DashboardFilterProvider, useDashboardFilter } from './DashboardFilterContext';

// ===== ADD NEW EXPORTS =====
export { ManagerProvider, useManager } from './ManagerContext';
export { StaffProvider, useStaff } from './StaffContext';
export { ChampionProvider, useChampion } from './ChampionContext';
export { ReadOnlyProvider, useReadOnly } from './ReadOnlyContext';