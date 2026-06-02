// frontend/src/hooks/kpi/index.js

// ============ KPI Hooks ============
export {
    useKPI,
    useKPIs,
    useKPIWeights,
    useKPITargets,
    useKPIScores
} from './useKPI';

// ============ Target Hooks ============
export {
    useTarget,
    useTargets,
    useTargetPhasing,
    useTargetCascade
} from './useTarget';

// ============ Actual Hooks ============
export {
    useActual,
    useActuals,
    useActualEntry,
    useActualValidation
} from './useActual';

// ============ Score Hooks ============
export {
    useScore,
    useScores,
    useAggregatedScores,
    useTrafficLight
} from './useScore';

// ============ Dashboard Hooks ============
export {
    useIndividualDashboard,
    useManagerDashboard,
    useExecutiveDashboard,
    useChampionDashboard
} from './useDashboard';

// ============ Framework Admin Hooks (NEW) ============
export {
    useSectors,
    useFrameworks,
    useCategories,
    useTemplates,
    useAdminOverview,
    useFrameworkAdmin,
} from './useFramework';

// ============ WebSocket Hooks ============
export {
    useWebSocket,
    useKPINotifications,
    useScoreUpdates,
    useValidationUpdates
} from './useWebSocket';

// ============ Query Hooks ============
export { useQuery, useMutation } from './useQuery';

// ============ Form Hooks ============
export { useForm, useValidation } from './useForm';

// ============ System Settings Hooks ============
export { default as useKpiSystemSettings } from './useKpiSystemSettings';
export { default as useReferenceData } from './useReferenceData';

// ============ My KPIs Hooks ============
export { useMyKPIs, useMyKPITargets, useMyKPIScores, useMyKPIActuals, useMyKPIWeights } from './useMyKPIs';

// ============ Utilities ============
export { default as useToast } from './useToast';
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as usePrevious } from './usePrevious';
export { default as useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';
export { default as useClickOutside } from './useClickOutside';
export { default as useKeyPress } from './useKeyPress';
export { default as useInterval } from './useInterval';
export { default as useTimeout } from './useTimeout';
export { default as useEventListener } from './useEventListener';