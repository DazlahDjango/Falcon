// Core KPI hooks
export { default as useKPIs } from './useKPIs';
export { default as useKPI } from './useKPI';
export { default as useCreateKPI } from './useCreateKPI';
export { default as useUpdateKPI } from './useUpdateKPI';
export { default as useDeleteKPI } from './useDeleteKPI';
export { default as useKPIWeights } from './useKPIWeights';
export { default as useKPIValidation } from './useKPIValidation';
export { default as useKPIDependencies } from './useKPIDependencies';
export { default as useStrategicLinkages } from './useStrategicLinkages';

// Framework hooks
export { default as useSectors } from './useSectors';
export { default as useFrameworks } from './useFrameworks';
export { default as useFramework } from './useFramework';
export { default as useCategories } from './useCategories';
export { default as useCategoryTree } from './useCategoryTree';
export { default as useTemplates } from './useTemplates';

// Target hooks
export { default as useTargets } from './useTargets';
export { default as useTarget } from './useTarget';
export { default as useMonthlyPhasing } from './useMonthlyPhasing';
export { default as useCascadeRules } from './useCascadeRules';
export { default as useTargetCascade } from './useTargetCascade';

// Actual hooks
export { default as useActuals } from './useActuals';
export { default as useActual } from './useActual';
export { default as useSubmitActual } from './useSubmitActual';
export { default as useEvidence } from './useEvidence';
export { default as useActualAdjustments } from './useActualAdjustments';

// Score hooks
export { default as useScores } from './useScores';
export { default as useMyScores } from './useMyScores';
export { default as useTeamScores } from './useTeamScores';
export { default as useScoreStatistics } from './useScoreStatistics';
export { default as useAggregatedScores } from './useAggregatedScores';
export { default as useRedAlerts } from './useRedAlerts';
export { default as useTrafficLights } from './useTrafficLights';

// Validation hooks
export { default as useValidations } from './useValidations';
export { default as usePendingValidations } from './usePendingValidations';
export { default as useRejectionReasons } from './useRejectionReasons';
export { default as useEscalations } from './useEscalations';

// Dashboard hooks
export { default as useIndividualDashboard } from './useIndividualDashboard';
export { default as useManagerDashboard } from './useManagerDashboard';
export { default as useExecutiveDashboard } from './useExecutiveDashboard';
export { default as useChampionDashboard } from './useChampionDashboard';
export { default as useAdminOverview } from './useAdminOverview';

// Analytics hooks
export { default as useKPISummaries } from './useKPISummaries';
export { default as useDepartmentRollups } from './useDepartmentRollups';
export { default as useOrganizationHealth } from './useOrganizationHealth';
export { default as useAnalyticsInsights } from './useAnalyticsInsights';
export { default as usePredictions } from './usePredictions';
export { default as useHeatmap } from './useHeatmap';
export { default as useCustomReport } from './useCustomReport';

// User nested hooks
export { default as useUserKPIs } from './useUserKPIs';
export { default as useUserTargets } from './useUserTargets';
export { default as useUserScores } from './useUserScores';
export { default as useUserActuals } from './useUserActuals';

// Operation hooks
export { default as useBulkUpload } from './useBulkUpload';
export { default as useCalculation } from './useCalculation';
export { default as useExport } from './useExport';
export { default as useSettings } from './useSettings';
export { default as useHistory } from './useHistory';
export { default as useKPIPermissions } from './useKPIPermissions';
export { default as useKPIWebSocket } from './useKPIWebSocket';