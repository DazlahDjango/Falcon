src/
├── main.jsx                          # Entry point
├── App.jsx                           # Root component
├── index.css                         # Global styles (Tailwind imports)
├── vite-env.d.ts                     # Vite env types
│
├── assets/                           # Static assets
│   ├── images/
│   │   ├── kpi/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── backgrounds/
│   └── styles/
│       ├── tailwind.css              # Tailwind directives
│       ├── globals.css               # Global styles
│       └── variables.css             # CSS variables
│
├── config/ (or conf/)                # Configuration
│   ├── api.config.js
│   ├── app.config.js
│   ├── environment.js
│   ├── websocket.config.js
│   └── index.js
│
├── providers/                        # Context Providers
│   ├── AuthProvider.jsx
│   ├── ThemeProvider.jsx
│   ├── ToastProvider.jsx
│   ├── ErrorBoundary.jsx
│   ├── QueryProvider.jsx
│   ├── StoreProvider.jsx
│   └── index.js
│
├── layouts/                          # Layout components
│   └── MainLayout/
│       ├── MainLayout.jsx
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       ├── Footer.jsx
│       └── *.module.css
│
├── routes/ (or rootes/)              # Routing
│   ├── index.js
│   ├── PrivateRoute.jsx
│   ├── PublicRoute.jsx
│   └── *.routes.jsx
│
├── pages/                            # Page components
│   ├── accounts/                     # Auth pages
│   ├── dashboard/                    # NEW: Dashboard pages
│   │   ├── IndividualDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   ├── ExecutiveDashboard.jsx
│   │   └── ChampionDashboard.jsx
│   ├── kpi/                          # KPI pages
│   │   ├── KPIList.jsx
│   │   ├── KPIDetail.jsx
│   │   ├── KPIForm.jsx
│   │   ├── FrameworkList.jsx
│   │   └── TargetPhasing.jsx
│   ├── reviews/                      # NEW: Performance Reviews
│   │   ├── ReviewList.jsx
│   │   ├── ReviewForm.jsx
│   │   ├── SelfAssessment.jsx
│   │   └── SupervisorEvaluation.jsx
│   ├── missions/                     # NEW: Mission Status Report
│   │   ├── MissionReportList.jsx
│   │   ├── MissionReportForm.jsx
│   │   └── MissionReportView.jsx
│   ├── workflows/                    # NEW: Workflow management
│   │   ├── WorkflowList.jsx
│   │   ├── WorkflowBuilder.jsx
│   │   ├── ApprovalQueue.jsx
│   │   └── ValidationHistory.jsx
│   ├── analytics/                    # NEW: Analytics & Insights
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── KPIInsights.jsx
│   │   ├── PredictiveAnalytics.jsx
│   │   ├── Trends.jsx
│   │   └── RiskPredictions.jsx
│   ├── reports/                      # NEW: Reporting
│   │   ├── ReportList.jsx
│   │   ├── ReportBuilder.jsx
│   │   ├── ScheduledReports.jsx
│   │   ├── ExportCenter.jsx
│   │   └── ComplianceReport.jsx
│   ├── notifications/                # NEW: Notifications center
│   │   ├── NotificationList.jsx
│   │   ├── NotificationPreferences.jsx
│   │   ├── RedAlerts.jsx
│   │   └── Escalations.jsx
│   ├── tenants/                      # NEW: Multi-tenant management (Super Admin only)
│   │   ├── TenantList.jsx
│   │   ├── TenantDetail.jsx
│   │   ├── TenantForm.jsx
│   │   ├── SubscriptionManager.jsx
│   │   └── TenantSettings.jsx
│   ├── ml/                          # NEW: Machine Learning / Predictive
│   │   ├── ModelDashboard.jsx
│   │   ├── TrainingMonitor.jsx
│   │   ├── PredictionsView.jsx
│   │   ├── AnomalyDetection.jsx
│   │   └── Recommendations.jsx
│   └── organisations/                # Existing org pages
│
├── components/                       # Reusable components
│   ├── common/                       # Shared components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Toast.jsx
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── DatePicker.jsx
│   │   ├── FileUpload.jsx
│   │   └── ConfirmDialog.jsx
│   ├── kpi/                          # KPI components
│   │   ├── KPIChart.jsx
│   │   ├── KPICard.jsx
│   │   ├── TrafficLight.jsx
│   │   ├── ScoreGauge.jsx
│   │   ├── TargetPhasingWizard.jsx
│   │   ├── BulkUpload.jsx
│   │   └── ScoreTrend.jsx
│   ├── dashboard/                    # Dashboard components
│   │   ├── TeamOverview.jsx
│   │   ├── PerformanceGrid.jsx
│   │   ├── KPIProgress.jsx
│   │   ├── RedAlertWidget.jsx
│   │   └── DepartmentRollup.jsx
│   ├── reviews/
│   │   ├── ReviewCard.jsx
│   │   ├── RatingScale.jsx
│   │   └── CommentBox.jsx
│   ├── missions/
│   │   ├── MissionStatusCard.jsx
│   │   └── NarrativeEditor.jsx
│   ├── workflows/
│   │   ├── ApprovalFlow.jsx
│   │   ├── ValidationBadge.jsx
│   │   └── WorkflowStep.jsx
│   ├── analytics/
│   │   ├── InsightCard.jsx
│   │   ├── TrendLine.jsx
│   │   └── PredictionMarker.jsx
│   ├── reports/
│   │   ├── ReportFilter.jsx
│   │   └── ExportButton.jsx
│   ├── notifications/
│   │   ├── NotificationBell.jsx
│   │   └── RedAlertBadge.jsx
│   └── accounts/                     # Auth components
│
├── hooks/                            # Custom React hooks
│   ├── kpi/
│   │   ├── useKPI.js
│   │   ├── useKPIFilters.js
│   │   ├── useScores.js
│   │   ├── useTargets.js
│   │   └── useActuals.js
│   ├── dashboard/
│   │   ├── useDashboard.js
│   │   ├── useTeamDashboard.js
│   │   └── useExecutiveDashboard.js
│   ├── reviews/
│   │   ├── useReviews.js
│   │   └── useApprovals.js
│   ├── workflows/
│   │   └── useWorkflow.js
│   ├── analytics/
│   │   ├── useAnalytics.js
│   │   └── usePredictions.js
│   ├── notifications/
│   │   └── useNotifications.js
│   ├── websocket/
│   │   ├── useWebSocket.js
│   │   └── useRealtimeUpdates.js
│   └── accounts/                     # Auth hooks
│
├── services/                         # API services
│   ├── api/                          # Base API client
│   │   └── client.js
│   ├── auth/                         # Auth service
│   ├── kpi/                          # KPI services
│   │   ├── kpi.service.js
│   │   ├── target.service.js
│   │   ├── actual.service.js
│   │   ├── score.service.js
│   │   ├── validation.service.js
│   │   └── framework.service.js
│   ├── dashboard/                    # Dashboard services
│   │   ├── individual.service.js
│   │   ├── manager.service.js
│   │   ├── executive.service.js
│   │   └── champion.service.js
│   ├── reviews/                      # Review services
│   │   ├── review.service.js
│   │   └── appraisal.service.js
│   ├── missions/                     # Mission report services
│   │   └── mission.service.js
│   ├── workflows/                    # Workflow services
│   │   ├── workflow.service.js
│   │   └── validation.service.js
│   ├── analytics/                    # Analytics services
│   │   ├── analytics.service.js
│   │   ├── insights.service.js
│   │   └── predictions.service.js
│   ├── reports/                      # Report services
│   │   ├── report.service.js
│   │   └── export.service.js
│   ├── notifications/                # Notification services
│   │   └── notification.service.js
│   ├── tenants/                      # Tenant services
│   │   └── tenant.service.js
│   ├── ml/                           # ML services
│   │   ├── model.service.js
│   │   └── prediction.service.js
│   ├── organisations/                # Org services
│   ├── websocket/                    # WebSocket service
│   │   ├── WebSocketClient.js
│   │   └── handlers.js
│   └── files/                        # File upload service
│
├── store/                            # Redux state management
│   ├── index.js
│   ├── rootReducer.js
│   ├── accounts/                     # Auth slices
│   ├── organisations/                # Org slices
│   ├── kpi/                          # KPI slices
│   │   ├── kpiSlice.js
│   │   ├── targetSlice.js
│   │   ├── actualSlice.js
│   │   ├── scoreSlice.js
│   │   ├── validationSlice.js
│   │   └── frameworkSlice.js
│   ├── dashboard/                    # Dashboard slices
│   │   ├── individualDashboardSlice.js
│   │   ├── managerDashboardSlice.js
│   │   ├── executiveDashboardSlice.js
│   │   └── championDashboardSlice.js
│   ├── reviews/                      # Review slices
│   │   └── reviewSlice.js
│   ├── missions/                     # Mission slices
│   │   └── missionSlice.js
│   ├── workflows/                    # Workflow slices
│   │   └── workflowSlice.js
│   ├── analytics/                    # Analytics slices
│   │   └── analyticsSlice.js
│   ├── notifications/                # Notification slices
│   │   └── notificationSlice.js
│   ├── tenants/                      # Tenant slices
│   │   └── tenantSlice.js
│   ├── ml/                           # ML slices
│   │   └── mlSlice.js
│   └── selectors/                    # Reselect selectors
│       ├── kpiSelectors.js
│       ├── dashboardSelectors.js
│       └── index.js
│
├── contexts/                         # React Context
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── WebSocketContext.jsx
│   └── organisations/
│
├── utils/                            # Utility functions
│   ├── date/
│   │   ├── formatters.js
│   │   └── periodUtils.js
│   ├── number/
│   │   ├── calculators.js
│   │   └── formatters.js
│   ├── kpi/
│   │   ├── scoreCalculator.js
│   │   ├── trafficLight.js        # GREEN/YELLOW/RED logic
│   │   └── aggregation.js
│   ├── charts/
│   │   ├── chartConfig.js
│   │   └── colorSchemes.js
│   ├── validators/
│   │   ├── kpiValidation.js
│   │   └── formValidation.js
│   ├── storage/
│   │   ├── localStorage.js
│   │   └── sessionStorage.js
│   └── error/
│       ├── errorHandler.js
│       └── sentry.js
│
├── styles/                           # Global styles (alternative location)
│   ├── global.css
│   ├── variables.css
│   ├── pages.css
│   ├── theme/
│   │   ├── light.css
│   │   └── dark.css
│   └── components/
│
└── templates/                        # Email templates
    ├── accounts/
    └── organisations/
        ├── invite.html
        └── reset-password.html