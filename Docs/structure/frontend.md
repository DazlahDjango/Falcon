src/
├── pages/
│   └── structure/                         # Structure pages
│       ├── index.js                        # Barrel export
│       ├── DepartmentList.jsx              # List all departments
│       ├── DepartmentDetail.jsx            # Department details with hierarchy
│       ├── DepartmentForm.jsx              # Create/Edit department
│       ├── DepartmentTree.jsx              # Visual department tree
│       ├── TeamList.jsx                    # List all teams
│       ├── TeamDetail.jsx                  # Team details with members
│       ├── TeamForm.jsx                    # Create/Edit team
│       ├── TeamHierarchy.jsx               # Visual team hierarchy
│       ├── PositionList.jsx                # List all positions
│       ├── PositionDetail.jsx              # Position details
│       ├── PositionForm.jsx                # Create/Edit position
│       ├── EmploymentList.jsx              # List all employments
│       ├── EmploymentDetail.jsx            # Employment details
│       ├── EmploymentForm.jsx              # Create/Edit employment
│       ├── EmploymentTransfer.jsx          # Transfer employee
│       ├── ReportingLineList.jsx           # Reporting relationships
│       ├── ReportingLineForm.jsx           # Create/Edit reporting line
│       ├── OrganizationChart.jsx           # Full org chart visualization
│       ├── CostCenterList.jsx              # Cost centers
│       ├── CostCenterForm.jsx              # Create/Edit cost center
│       ├── LocationList.jsx                # Locations
│       ├── LocationForm.jsx                # Create/Edit location
│       ├── HierarchyVersionList.jsx        # Version history
│       ├── HierarchyCompare.jsx            # Compare versions
│       └── StructureDashboard.jsx          # Structure analytics dashboard
│
├── components/
│   └── structure/                          # Structure-specific components
│       ├── index.js                        # Barrel export
│       │
│       ├── common/                         # Shared structure components
│       │   ├── DepartmentBadge.jsx         # Department chip/badge
│       │   ├── TeamBadge.jsx               # Team chip/badge
│       │   ├── PositionBadge.jsx           # Position chip/badge
│       │   ├── ReportingBadge.jsx          # Reporting relationship badge
│       │   ├── HierarchyPath.jsx           # Breadcrumb path display
│       │   ├── OrgTreeNode.jsx             # Recursive tree node
│       │   ├── EmployeeAvatar.jsx          # Employee avatar with position
│       │   ├── ManagerCard.jsx             # Manager information card
│       │   ├── SubordinateList.jsx         # List of direct reports
│       │   ├── SpanOfControlIndicator.jsx  # Manager span visualization
│       │   └── StructureSearchBar.jsx      # Search across structure
│       │
│       ├── department/                     # Department components
│       │   ├── DepartmentCard.jsx          # Department summary card
│       │   ├── DepartmentStats.jsx         # Department statistics
│       │   ├── DepartmentTreeView.jsx      # Tree view of departments
│       │   ├── DepartmentSelector.jsx      # Dropdown selector
│       │   ├── DepartmentMoveModal.jsx     # Move department modal
│       │   └── DepartmentAncestors.jsx     # Ancestor path display
│       │
│       ├── team/                           # Team components
│       │   ├── TeamCard.jsx                # Team summary card
│       │   ├── TeamStats.jsx               # Team statistics
│       │   ├── TeamMembersList.jsx         # List of team members
│       │   ├── TeamSelector.jsx            # Dropdown selector
│       │   ├── TeamHierarchyView.jsx       # Tree view of teams
│       │   ├── AddMemberModal.jsx          # Add member to team modal
│       │   └── RemoveMemberModal.jsx       # Remove member from team modal
│       │
│       ├── position/                       # Position components
│       │   ├── PositionCard.jsx            # Position summary card
│       │   ├── PositionSelector.jsx        # Dropdown selector
│       │   ├── PositionIncumbents.jsx      # List of people in position
│       │   ├── PositionReportingChain.jsx  # Up/down reporting chain
│       │   ├── VacantPositionBadge.jsx     # Vacant position indicator
│       │   └── PositionLevelTag.jsx        # Grade/level tag
│       │
│       ├── employment/                     # Employment components
│       │   ├── EmploymentCard.jsx          # Employment summary card
│       │   ├── EmploymentHistory.jsx       # Timeline of employments
│       │   ├── EmploymentStatusBadge.jsx   # Active/Inactive badge
│       │   ├── EmploymentTransferForm.jsx  # Transfer form
│       │   ├── CurrentEmploymentCard.jsx   # Current employment display
│       │   └── EmploymentFilters.jsx       # Filter controls
│       │
│       ├── reporting/                      # Reporting components
│       │   ├── ReportingLineCard.jsx       # Reporting relationship card
│       │   ├── ReportingMatrix.jsx         # Matrix organization view
│       │   ├── DottedLineManager.jsx       # Dotted line management
│       │   ├── InterimManagerBadge.jsx     # Interim manager indicator
│       │   ├── ReportingWeightSlider.jsx   # Weight adjustment slider
│       │   └── ApprovalPermissions.jsx     # KPI/review approval toggles
│       │
│       ├── hierarchy/                      # Hierarchy visualization
│       │   ├── OrgTreeVisualization.jsx    # Main org tree (ECharts)
│       │   ├── SunburstChart.jsx           # Sunburst view of org
│       │   ├── TreemapView.jsx             # Treemap by size/headcount
│       │   ├── ForceDirectedGraph.jsx      # Network graph of reporting
│       │   ├── HierarchyControls.jsx       # Zoom/expand controls
│       │   ├── VersionTimeline.jsx         # Version history timeline
│       │   ├── VersionCompareView.jsx      # Side-by-side comparison
│       │   └── HierarchyExportOptions.jsx  # Export buttons
│       │
│       ├── cost-center/                    # Cost center components
│       │   ├── CostCenterCard.jsx          # Cost center summary
│       │   ├── BudgetGauge.jsx             # Budget utilization gauge
│       │   ├── CostCenterTree.jsx          # Hierarchy tree
│       │   └── AllocationEditor.jsx        # Percentage allocation editor
│       │
│       ├── location/                       # Location components
│       │   ├── LocationCard.jsx            # Location summary
│       │   ├── LocationMap.jsx             # Map visualization
│       │   ├── OccupancyGauge.jsx          # Seating occupancy gauge
│       │   ├── CountrySelector.jsx         # Country dropdown
│       │   └── TimezoneSelector.jsx        # Timezone picker
│       │
│       ├── charts/                         # Structure charts
│       │   ├── DepartmentBreakdown.jsx     # Department distribution
│       │   ├── HeadcountTrend.jsx          # Headcount over time
│       │   ├── ManagerRatioChart.jsx       # Manager to employee ratio
│       │   ├── SpanOfControlChart.jsx      # Manager span distribution
│       │   ├── LevelDistribution.jsx       # Position level distribution
│       │   ├── TypeDistribution.jsx        # Employment type distribution
│       │   ├── LocationHeatmap.jsx         # Geographic distribution
│       │   └── HierarchyHealthGauge.jsx    # Health score gauge
│       │
│       └── modals/                         # Structure modals
│           ├── ConfirmDeleteModal.jsx      # Delete confirmation
│           ├── BulkUploadModal.jsx         # CSV/Excel upload
│           ├── BulkReassignModal.jsx       # Bulk manager reassign
│           ├── ExportOptionsModal.jsx      # Export format selection
│           ├── RestoreVersionModal.jsx     # Version restore confirmation
│           └── CycleDetectionModal.jsx     # Cycle repair dialog
│
├── services/
│   └── structure/                          # Structure API services
│       ├── index.js                        # Barrel export
│       ├── department.service.js           # Department CRUD operations
│       ├── team.service.js                 # Team CRUD operations
│       ├── position.service.js             # Position CRUD operations
│       ├── employment.service.js           # Employment CRUD operations
│       ├── reporting.service.js            # Reporting line operations
│       ├── hierarchy.service.js            # Hierarchy tree operations
│       ├── orgChart.service.js             # Org chart generation
│       ├── costCenter.service.js           # Cost center operations
│       ├── location.service.js             # Location operations
│       ├── bulk.service.js                 # Bulk operations
│       └── structureAdmin.service.js       # Admin operations
│
├── hooks/
│   └── structure/                          # Structure custom hooks
│       ├── index.js                        # Barrel export
│       ├── useDepartment.js                # Department data fetching
│       ├── useDepartments.js               # List of departments
│       ├── useDepartmentTree.js            # Hierarchical department tree
│       ├── useTeam.js                      # Team data fetching
│       ├── useTeams.js                     # List of teams
│       ├── useTeamHierarchy.js             # Team tree structure
│       ├── usePosition.js                  # Position data fetching
│       ├── usePositions.js                 # List of positions
│       ├── useEmployment.js                # Employment data fetching
│       ├── useEmployments.js               # List of employments
│       ├── useCurrentEmployment.js         # Current employment for user
│       ├── useReportingLine.js             # Reporting relationship
│       ├── useReportingChain.js            # Full reporting chain
│       ├── useSpanOfControl.js             # Manager span metrics
│       ├── useHierarchyTree.js             # Complete org tree
│       ├── useHierarchyVersions.js         # Version history
│       ├── useOrgChart.js                  # Org chart data
│       ├── useCostCenter.js                # Cost center data
│       ├── useLocation.js                  # Location data
│       ├── useStructureStats.js            # Statistics aggregation
│       ├── useHierarchyHealth.js           # Health monitoring
│       ├── useBulkOperations.js            # Bulk operation state
│       ├── useStructureSearch.js           # Search across structure
│       └── useStructureWebSocket.js        # Real-time structure updates
│
├── store/
│   └── slices/
│       └── structure/                      # Structure Redux slices
│           ├── index.js                    # Barrel export
│           ├── departmentSlice.js          # Department state
│           ├── teamSlice.js                # Team state
│           ├── positionSlice.js            # Position state
│           ├── employmentSlice.js          # Employment state
│           ├── reportingSlice.js           # Reporting line state
│           ├── hierarchySlice.js           # Hierarchy state
│           ├── orgChartSlice.js            # Org chart state
│           ├── costCenterSlice.js          # Cost center state
│           ├── locationSlice.js            # Location state
│           ├── structureUiSlice.js         # UI state (modals, filters)
│           └── structureSelectors.js       # Memoized selectors
│
├── constants/
│   └── structure.constants.js              # Structure constants
│
├── utils/
│   └── structure/                          # Structure utilities
│       ├── index.js                        # Barrel export
│       ├── hierarchyUtils.js               # Tree traversal helpers
│       ├── pathUtils.js                    # Path resolution
│       ├── formatUtils.js                  # Formatters for display
│       ├── validationUtils.js              # Form validators
│       ├── exportUtils.js                  # Export helpers
│       ├── chartUtils.js                   # Chart data transformers
│       └── searchUtils.js                  # Search/filter helpers
│
└── routes/
    └── structure.routes.js                 # Structure routing configuration