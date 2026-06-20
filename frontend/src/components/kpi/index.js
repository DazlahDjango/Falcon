/**
 * KPI Components Index
 * Main export file for all KPI components
 */

// ============ Common Components ============
export {
    KPILoading,
    KPIError,
    KPIEmptyState,
    KPISuccess,
    KPIConfirmDialog,
    KPIFilterBar,
    KPIPagination,
    KPISearchBar,
    KPIDateRangePicker,
    KPIStatusBadge,
    KPIScoreGauge,
} from './common';

// ============ Validations Components ============
export {
    PendingValidations,
    ValidationModal,
    ValidationCard,
    ValidationList,
    ValidationDetail,
    RejectionReasonSelect,
    EscalationPanel,
    EscalationForm,
    EscalationList,
    EscalationDetail,
    PendingSummaryCard,
} from './validations';

// ============ Scores Components ============
export {
    ScoreCard,
    ScoreList,
    ScoreTable,
    ScoreFilters,
    ScoreStatistics,
    TrafficLight,
    TrafficLightIcon,
    AggregatedScores,
    DepartmentRanking,
    RedAlertsList,
    RedAlertCard,
} from './scores';

// ============ Actuals Components ============
export {
    // Submission
    ActualSubmit,
    ActualForm,
    ActualValueInput,
    EvidenceUpload,
    EvidencePreview,
    // List
    ActualList,
    ActualTable,
    ActualFilters,
    ActualStatusBadge,
    // Detail
    ActualDetail,
    ActualInfo,
    ActualEvidence,
    ActualValidations,
    // Adjustments
    ActualAdjustmentList,
    ActualAdjustmentForm,
    ActualAdjustmentApprove,
} from './actuals';

// ============ Targets Components ============
export {
    // List
    TargetList,
    TargetCard,
    TargetTable,
    TargetFilters,
    // Create
    TargetCreate,
    TargetCreateForm,
    // Phasing
    MonthlyPhasing,
    MonthlyPhasingTable,
    MonthlyPhasingChart,
    PhasingStrategySelect,
    PhasingLockCycle,
    // Cascade
    CascadeRules,
    CascadeRuleForm,
    CascadeRuleList,
    CascadeMapping,
    CascadeDepartment,
    CascadeTree,
    CascadeRollback,
} from './targets';

// ============ Framework Components ============
export {
    // Sectors
    SectorList,
    SectorCard,
    SectorForm,
    SectorDetail,
    SectorDeleteConfirm,
    // Frameworks
    FrameworkList,
    FrameworkCard,
    FrameworkForm,
    FrameworkDetail,
    FrameworkWizard,
    FrameworkPublish,
    FrameworkDuplicate,
    FrameworkArchive,
    // Categories
    CategoryList,
    CategoryTree,
    CategoryForm,
    CategoryMove,
    CategoryDeleteConfirm,
    // Templates
    TemplateList,
    TemplateCard,
    TemplateForm,
    TemplateDetail,
    TemplateUseConfirm,
} from './framework';

// ============ KPI Management Components ============
export {
    // List
    KPIList,
    KPICard,
    KPITable,
    KPIFilters,
    KPISearch,
    // Create
    KPICreate,
    KPICreateStep1,
    KPICreateStep2,
    KPICreateStep3,
    KPICreateSuccess,
    // Detail
    KPIDetail,
    KPIInfo,
    KPIStats,
    KPITargets,
    KPIScores,
    KPIWeights,
    KPIDependencies,
    KPIStrategicLinkages,
    KPIValidation,
    KPIHistory,
    // Edit
    KPIEdit,
    KPIEditBasic,
    KPIEditConfig,
    KPIEditAssignments,
    KPIActivateDeactivate,
    KPIArchive,
    // Weight Management
    KPIWeightManager,
    KPIWeightForm,
    KPIWeightList,
    KPIWeightValidation,
} from './kpi-management';

// ============ Analytics Components ============
export {
    // Reports
    ReportGenerator,
    ReportFilters,
    ReportPreview,
    ExportOptions,
    CustomReportBuilder,
    // Summaries
    KPISummaryTable,
    KPISummaryCard,
    KPISummaryFilters,
    DepartmentRollupTable,
    // Insights
    AnalyticsInsights,
    InsightsOverview,
    TrendAnalysis,
    TopDepartments,
    AreasForImprovement,
    RiskPredictions,
    PerformanceHeatmap,
    // Health
    OrganizationHealth,
    HealthScoreCard,
    HealthHistoryChart,
    KPIGauge,
} from './analytics';

// ============ Bulk Components ============
export {
    BulkUpload,
    BulkKPIUpload,
    BulkActualUpload,
    BulkTargetUpload,
    UploadPreview,
    UploadResults,
    UploadErrors,
    TemplateDownload,
} from './bulk';

// ============ Calculations Components ============
export {
    CalculationTrigger,
    CalculationStatus,
    CalculationProgress,
    CalculationHistory,
} from './calculations';

// ============ Exports Components ============
export {
    ExportButton,
    ExportModal,
    ExportOptions as ExportFormatOptions,
    ExportProgress,
} from './exports';

// ============ Settings Components ============
export {
    SystemSettings,
    SettingsForm,
    SettingsReset,
    ReferenceData,
    ReferenceDataTable,
    NotificationPreferences,
    NotificationTypes,
} from './settings';

// ============ History Components ============
export {
    AuditLogs,
    KPIHistoryTable,
    ActualHistoryTable,
    TargetHistoryTable,
    HistoryFilters,
    HistoryDetail,
} from './history';

// ============ Users Components ============
export {
    UserKPIs,
    UserTargets,
    UserScores,
    UserActuals,
    UserProfileKPISection,
} from './users';

// ============ Dashboard Components ============
export {
    // Individual Dashboard
    IndividualDashboard,
    MyKPIScores,
    RecentActivity,
    Achievements,
    PerformanceTrend,
    // Manager Dashboard
    ManagerDashboard,
    TeamPerformance,
    TeamMembersTable,
    StatusDistribution,
    PendingValidationsCard,
    MissingSubmissionsCard,
    // Executive Dashboard
    ExecutiveDashboard,
    OrganizationHealth as ExecutiveOrganizationHealth,
    DepartmentRankings,
    RedAlertKPIs as ExecutiveRedAlertKPIs,
    TrendAnalysis as ExecutiveTrendAnalysis,
    RiskIndicators,
    // Champion Dashboard
    ChampionDashboard,
    DepartmentCompliance,
    SubmissionRateCard,
    PendingEscalationsCard,
    RedAlertKPIs as ChampionRedAlertKPIs,
    // Admin Dashboard
    AdminDashboard,
    AdminOverview,
    SystemHealth,
    CacheManager,
} from './dashboard';