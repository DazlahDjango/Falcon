# Need installation libraries
1. Echarts

frontend/src/
├── index.js                  # Entry point
├── App.jsx                   # Main App component
│
├── components/
│   ├── shared/               # Shared components (Button, Card, Modal, etc.)
│   └── kpi/                  # KPI-specific components
│       ├── common/           # Common KPI components
│       │   ├── KPIChart/     # Chart components
│       │   ├── TrafficLight/ # Traffic light components
│       │   ├── ScoreGauge/   # Score gauge component
│       │   ├── KPICard/      # KPI card component
│       │   ├── PeriodSelector/ # Period selector
│       │   ├── KPIForm/      # KPI form components
│       │   ├── TargetForm/   # Target form components
│       │   ├── ActualEntry/  # Actual entry components
│       │   ├── ValidationWorkflow/ # Validation components
│       │   └── DataTable/    # Table components
│       │
│       ├── dashboards/       # Dashboard components
│       │   ├── IndividualDashboard/
│       │   ├── ManagerDashboard/
│       │   ├── ExecutiveDashboard/
│       │   └── ChampionDashboard/
│       │
│       └── modules/          # Feature modules
│           ├── KPIManagement/
│           ├── TargetManagement/
│           ├── PerformanceTracking/
│           └── ReportsAnalytics/
│
├── services/
│   ├── api/                  # API client
│   │   ├── axios.config.js
│   │   ├── endpoints.js
│   │   └── interceptors.js
│   │
│   ├── kpi/                  # KPI services
│   │   ├── kpi.service.js
│   │   ├── target.service.js
│   │   ├── actual.service.js
│   │   ├── score.service.js
│   │   ├── validation.service.js
│   │   ├── dashboard.service.js
│   │   └── analytics.service.js
│   │
│   ├── websocket/            # WebSocket services
│   │   ├── websocket.service.js
│   │   └── kpi.websocket.js
│
├── hooks/
│   ├── useKPI.js
│   ├── useTarget.js
│   ├── useActual.js
│   ├── useScore.js
│   ├── useDashboard.js
│   ├── useWebSocket.js
│   ├── useForm.js
│   └── useQuery.js
│
├── store/                    # Redux store
│   ├── store.js
│   ├── rootReducer.js
│   └── slices/
│       ├── kpi/
│       │   ├── kpiSlice.js
│       │   ├── targetSlice.js
│       │   ├── actualSlice.js
│       │   ├── scoreSlice.js
│       │   └── dashboardSlice.js
│       └── ui/
│           └── uiSlice.js
│
├── utils/                    # Utilities
│   ├── kpi/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── calculators.js
│   ├── date/
│   │   └── date.utils.js
│   ├── storage/
│   │   └── localStorage.js
│   └── error/
│       └── errorHandler.js
│
├── routes/                   # Routing
│   ├── index.jsx
│   ├── PrivateRoute.jsx
│   ├── PublicRoute.jsx
│   └── kpi.routes.jsx
│
├── assets/                   # Static assets
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── kpi/
│   │       ├── kpi.css
│   │       ├── dashboard.css
│   │       ├── charts.css
│   │       └── forms.css
│   └── images/
│
└── config/  
    ├──config/                 # Configuration
    ├── environment.js
    ├── api.config.js
    ├── websocket.config.js
    └── app.config.js