<<<<<<< HEAD
Hello
Look at those picture
1. Help me to style that kpi page/file
2. There's a middleware I don't know its which one but its so guarded or I don't know it's not a middleware.
Yesterday we bypassed viewing when you're super_admin, and it passed, I could see all the dashboards, but now all the actions that were working they need payment now, I don't know its billing middlewares, contexts or what are those, please help me with that, make sure in all middleware, the following bypasses everythin
a. Any role with super_admin
b. Any is_superuser=True
those two they need to bypass all the limits, either in backend middleware or frontend both context, middleware and any file that is limiting this
=======
>>>>>>> 05b41ec (Super admin dashboard initials)
Hello, hope you're doing great
I have this dashboard app though I've been fixing it for quit a while its still not working as intended
I'll share the image so that you see but here is what I see in the browser console

Uncaught TypeError: Cannot convert object to primitive value
    at String (<anonymous>)
    at chunk-ZMLY2J2T.js?v=6b2932e3:133:22
    at Array.map (<anonymous>)
    at printWarning (chunk-ZMLY2J2T.js?v=6b2932e3:132:39)
    at error (chunk-ZMLY2J2T.js?v=6b2932e3:120:15)
    at lazyInitializer (chunk-ZMLY2J2T.js?v=6b2932e3:898:17)
    at mountLazyComponent (chunk-276SZO74.js?v=6b2932e3:14822:27)
    at beginWork (chunk-276SZO74.js?v=6b2932e3:15918:22)
    at HTMLUnknownElement.callCallback2 (chunk-276SZO74.js?v=6b2932e3:3674:22)
    at Object.invokeGuardedCallbackDev (chunk-276SZO74.js?v=6b2932e3:3699:24)


{type: 'client', message: 'Cannot convert object to primitive value', details: 'TypeError: Cannot convert object to primitive valu….vite/deps/chunk-276SZO74.js?v=6b2932e3:19198:20)', originalError: TypeError: Cannot convert object to primitive value
    at String (<anonymous>)
    at http://local…, context: {…}, …}
context
: 
component
: 
"Unknown"
errorInfo
: 
{componentStack: '\n    at Lazy\n    at Suspense\n    at div\n    at div…s/.vite/deps/chunk-VO62A76K.js?v=6b2932e3:923:11)'}
[[Prototype]]
: 
Object
details
: 
"TypeError: Cannot convert object to primitive value\n    at String (<anonymous>)\n    at http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:133:22\n    at Array.map (<anonymous>)\n    at printWarning (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:132:39)\n    at error (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:120:15)\n    at lazyInitializer (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:898:17)\n    at mountLazyComponent (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:14822:27)\n    at beginWork (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:15918:22)\n    at beginWork$1 (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:19753:22)\n    at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:19198:20)"
message
: 
"Cannot convert object to primitive value"
originalError
: 
TypeError: Cannot convert object to primitive value at String (<anonymous>) at http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:133:22 at Array.map (<anonymous>) at printWarning (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:132:39) at error (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:120:15) at lazyInitializer (http://localhost:5173/node_modules/.vite/deps/chunk-ZMLY2J2T.js?v=6b2932e3:898:17) at mountLazyComponent (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:14822:27) at beginWork (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:15918:22) at beginWork$1 (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:19753:22) at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/chunk-276SZO74.js?v=6b2932e3:19198:20)
timestamp
: 
"2026-05-28T17:26:45.542Z"
type
: 
"client"

I integrated the debuger in the routes and as you can see elements are successfully being imported

✅ [DEBUG] Module loaded for: SuperAdminDashboard
dashboard.routes.jsx:18 📦 [DEBUG] Available exports: (51) ['ApprovalsHistory', 'BillingOverview', 'BulkAssignPanel', 'ChampionDashboard', 'ChampionDashboardHeader', 'ClientAdminDashboard', 'CompliancePanel', 'DashboardConfigPanel', 'ExecutiveAlerts', 'ExecutiveDashboard', 'ExecutiveDashboardHeader', 'ExecutiveDepartments', 'ExecutiveOverview', 'ExecutiveReports', 'ExecutiveTrends', 'ExecutiveViewPanel', 'ExportPanel', 'KPIAssignmentPanel', 'KpiBreakdownPanel', 'ManagerDashboard', 'ManagerDashboardHeader', 'ManagerPendingApprovalsPanel', 'ManagerViewPanel', 'MissingDataPanel', 'MissionStatusPanel', 'MyKPIsPanel', 'PendingApprovalsPanel', 'PendingTasksPanel', 'PerformanceTrends', 'PlatformMetrics', 'PlatformOverview', 'ReadOnlyDashboard', 'ReadOnlyDashboardHeader', 'SettingsPanel', 'StaffDashboard', 'StaffDashboardHeader', 'StaffViewPanel', 'SubmissionHistory', 'SubscriptionAlerts', 'SuperAdminDashboard', 'SystemHealthPanel', 'TargetSettingsPanel', 'TeamMembersTable', 'TeamOverview', 'TeamPerformanceChart', 'TemplateLibrary', 'TenantDetailModal', 'TenantOverview', 'TenantsTable', 'UserActivityPanel', 'ViewSelector']

Now help me mostly you can see that useDashboardProfile file, see the one in accounts though it exists as a page and not a hook, its at components/accounts/users/UserProfile, this one is working properly

<<<<<<< HEAD
I had all the routes in the dashboard.routes.jsx file, I then moved some of the dashboard pages to the dashboard.routes file so that I could test only super admin dashboard
=======
I had all the routes in the dashboard.routes.jsx file, I then moved some of the dashboard pages to the dashboard.routes file so that I could test only super admin dashboard
>>>>>>> 05b41ec (Super admin dashboard initials)
