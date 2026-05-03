Hierarchy access service

websocketservice -> addNotification
# Pages
1. Dept
components/departmentStats, departmenFiters
2. Teams
Team -> setPageSize
Team -> sectors (TeamPagination and TeamFiters)
components -> TeamFiters
3. PositionList
Sectors -> position fiters, pagination
position setPositionPageSize
4. CostCenter
sectors -> a
5. Location
selectors -> loading and pagination
6. Emp
sectors -> Fiters & paginations
7. Dashboard
hoos -> useReportingLines
8. Hierarchy:

sectors -> selectHierarchyVersionsLoading, selectHierarchyVersionPagination,