// KPI Hooks
export { 
    useKPI, 
    useKPIs, 
    useKPIWeights, 
    useKPITargets, 
    useKPIScores 
} from './useKPI';

// Target Hooks
export {
    useTarget,
    useTargets,
    useTargetPhasing,
    useTargetCascade
} from './useTarget';

// Actual Hooks
export {
    useActual,
    useActuals,
    useActualEntry,
    useActualValidation
} from './useActual';

// Score Hooks
export {
    useScore,
    useScores,
    useAggregatedScores,
    useTrafficLight
} from './useScore';

// Dashboard Hooks
export {
    useIndividualDashboard,
    useManagerDashboard,
    useExecutiveDashboard,
    useChampionDashboard
} from './useDashboard';

// WebSocket Hooks
export {
    useWebSocket,
    useKPINotifications,
    useScoreUpdates,
    useValidationUpdates
} from './useWebSocket';

// Query Hooks
export { useQuery, useMutation } from './useQuery';

// Form Hooks
export { useForm, useValidation } from './useForm';

// Utilities
export { default as useDebounce } from './useDebounce';
export { default as useLocalStorage } from './useLocalStorage';
export { default as usePrevious } from './usePrevious';
export { default as useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';