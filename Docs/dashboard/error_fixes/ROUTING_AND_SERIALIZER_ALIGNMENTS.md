# Routing and Serializer Alignment Report

**Date**: May 28, 2026  
**Status**: RESOLVED & STABILIZED

---

## 1. 🔴 Critical Issue: DateTimeField Serialization Mismatch

### Location: `apps/dashboard/api/v1/serializers/staff.py`

### Symptoms:
- "cannot convert object to primitive" / "cannot change the value to primitive" error when loading the staff dashboard.

### Root Cause:
- The service layer for the staff dashboard (`staff_service.py`) returns pending submissions with pre-formatted ISO string dates (`p.submitted_at.isoformat() if p.submitted_at else None`).
- However, the `PendingSubmissionSerializer` was configured to use `serializers.DateTimeField` for `submitted_at`.
- DRF's `DateTimeField` expects a native Python `datetime` object. When it encounters a string that has already been converted to an ISO format primitive string, it can trigger encoding mismatches under certain JSON conversion scenarios, throwing the "cannot convert object to primitive" error.

### Solution Applied:
We modified `apps/dashboard/api/v1/serializers/staff.py` to use `serializers.CharField` for the `submitted_at` field:
```python
class PendingSubmissionSerializer(serializers.Serializer):
    """Pending submission serializer."""
    id = serializers.UUIDField()
    kpi_id = serializers.UUIDField()
    kpi_name = serializers.CharField()
    actual_value = serializers.FloatField()
    submitted_at = serializers.CharField(required=False, allow_null=True)
```
Since the service layer already yields a string, this passes it straight through safely to the frontend without further conversion attempts.

---

## 2. 🟠 Critical Issue: Hardcoded Index Route Redirect

### Location: `frontend/src/routes/dashboard.routes.jsx`

### Symptoms:
- Logging in as `super_admin` or any role other than `executive` redirects `/dashboard` to the Executive Dashboard overview (`/dashboard/executive/overview`).

### Root Cause:
- The dashboard router hardcoded the `/dashboard` index redirect to the executive dashboard:
  ```javascript
  { index: true, element: <Navigate to={DASHBOARD_ROUTES.EXECUTIVE.OVERVIEW} replace /> }
  ```
- This completely bypassed dynamic, role-based redirection.

### Solution Applied:
We imported `DashboardIndexRedirect` and used it as the element for the index route:
```javascript
import DashboardIndexRedirect from '../components/dashboard/common/DashboardIndexRedirect';

// ...
const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardShell />,
    children: [
      { index: true, element: <DashboardIndexRedirect /> },
      // ...
```
`DashboardIndexRedirect` dynamically retrieves the current user's role from context and redirects them to the correct dashboard via `getDefaultRouteByRole`.

---

## 3. 🟡 Critical Issue: Supervisor Role Mapping Mismatch

### Locations:
- `frontend/src/utils/dashboard/resolveDashboardRole.js`
- `frontend/src/config/constants/dashboardRouteConstants.js`

### Symptoms:
- Users with the `'supervisor'` role were falling back to `'staff'` dashboard pages and navigation sidebars.

### Root Cause:
- The backend uses `'supervisor'` as the system role code for team managers.
- However, the frontend had `DASHBOARD_TYPES.MANAGER` but omitted the `'supervisor'` mapping, meaning the `resolveDashboardRole` hook fell back to `'staff'`.
- Additionally, `getDashboardRoutesByRole` and `getNavItemsByRole` lacked `case 'supervisor'`, causing any direct supervisor route resolutions to fall back to staff routes.

### Solution Applied:
1. **Added `'supervisor'` mapping in `resolveDashboardRole.js`:**
   ```javascript
   const ROLE_TO_DASHBOARD = {
     ...
     manager: DASHBOARD_TYPES.MANAGER,
     supervisor: DASHBOARD_TYPES.MANAGER, // Map supervisor to manager
     ...
   };
   ```

2. **Added `'supervisor'` case in `dashboardRouteConstants.js`:**
   ```javascript
   export const getDashboardRoutesByRole = (role) => {
     switch (role) {
       ...
       case 'manager':
       case 'supervisor': // Map supervisor to manager routes
         return DASHBOARD_ROUTES.MANAGER;
       ...
     }
   }

   export const getNavItemsByRole = (role) => {
     switch (role) {
       ...
       case 'manager':
       case 'supervisor': // Map supervisor to manager navigation items
         return DASHBOARD_NAV_ITEMS.MANAGER;
       ...
     }
   }
   ```

---

## 4. 🔴 Critical Issue: Super Admin Access Blocked by Tenant Checks

### Location: `apps/dashboard/api/v1/permissions.py`

### Symptoms:
- Super Admin dashboard returns a `403 Forbidden` response and displays a loading screen or generic "failed to load" states.

### Root Cause:
- `DashboardBasePermission` requires a non-empty `tenant_id` on the user:
  ```python
  tenant_id = getattr(request.user, 'tenant_id', None)
  if not tenant_id:
      return False
  ```
- Because a Super Admin is a platform-wide system administrator, their user profile does not belong to any specific tenant (their `tenant_id` is null or None).
- As a result, the standard permission check denied their access directly.

### Solution Applied:
We updated `DashboardBasePermission` in `permissions.py` to allow `super_admin` accounts to bypass the `tenant_id` requirement, and allowed them full object level permissions:
```python
class DashboardBasePermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_id = getattr(request.user, 'tenant_id', None)
        if not tenant_id and request.user.role != 'super_admin':
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'super_admin':
            return True
        tenant_id = getattr(request.user, 'tenant_id', None)
        if hasattr(obj, 'tenant_id') and str(obj.tenant_id) != str(tenant_id):
            return False
        return True
```

---

## 5. 🔴 Critical Issue: React Crash When Rendering Error Objects

### Location: `frontend/src/components/dashboard/common/EmptyState.jsx`

### Symptoms:
- Page crashes with `TypeError: Cannot convert object to primitive value` at `String (<anonymous>)` when any API failure occurs (such as a 403 Forbidden or 404 Not Found error).

### Root Cause:
- The `useDashboard` hook sets its `error` state to a native JavaScript `Error` object when request errors are caught.
- Individual dashboard widgets pass this `Error` object directly to `EmptyState` via `message={error}`.
- Inside `EmptyState`, the prop was rendered directly inside a `<p>` element:
  ```javascript
  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{message}</p>
  ```
- Rendering a native `Error` object as a child in React throws a primitive conversion TypeError, crashing the React component tree.

### Solution Applied:
We added robust defensive rendering logic to `EmptyState.jsx` to safely handle `Error` objects and other non-primitives:
```javascript
export const EmptyState = ({ 
  title = 'No Data Available', 
  message = 'There is no data to display at this time.',
  icon = '📊',
  actionLabel = null,
  onAction = null,
  className = ''
}) => {
  const displayMessage = message instanceof Error 
    ? message.message 
    : (typeof message === 'object' && message !== null 
        ? JSON.stringify(message) 
        : String(message));

  return (
    <div className={`empty-state ${className}`} style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{displayMessage}</p>
      ...
```

---

## 6. 🔴 Critical Issue: Vite Circular Dependency Loop on Super Admin Pages

### Locations:
- `frontend/src/pages/dashboard/SuperAdminDashboard/TenantDetailModal.jsx`
- `frontend/src/pages/dashboard/SuperAdminDashboard/TenantsTable.jsx`
- `frontend/src/pages/dashboard/SuperAdminDashboard/SuperAdminTenants.jsx`

### Symptoms:
- Page crashes with `TypeError: Cannot convert object to primitive value` at `lazyInitializer` and `printWarning` during the loading of `SuperAdminDashboard` pages.

### Root Cause:
- A circular import dependency chain existed:
  `SuperAdminDashboard.jsx` (imports `TenantsTable.jsx`) -> `TenantsTable.jsx` (imports `TenantDetailModal.jsx`) -> `TenantDetailModal.jsx` (imports `useSuperAdminDashboard` hook) -> `useSuperAdminDashboard.js` (imports services/index) -> maps back to load `SuperAdminDashboard.jsx`.
- Vite's compilation process is unable to cleanly evaluate the export of `SuperAdminDashboard.jsx` due to this cyclic dependency, so it resolves it as `undefined` or an incomplete module object.
- React's `lazyInitializer` checks if the imported dynamic chunk is a valid React component. Detecting that the component is uninitialized, React logs a console error.
- During formatting of this console error, React formats Vite's module namespace object as a string, raising `TypeError: Cannot convert object to primitive value` inside the string formatter itself.

### Solution Applied:
We cleanly decoupled `TenantDetailModal` from the hook by passing `refreshTenantSnapshot` down through props:
1. **Removed `useSuperAdminDashboard` hook import and call** entirely from `TenantDetailModal.jsx`, receiving `onRefreshTenant` as a prop instead.
2. **Added `onRefreshTenant` prop to `TenantsTable.jsx`** and forwarded it to `TenantDetailModal`.
3. **Retrieved `refreshTenantSnapshot` from the hook** inside the page controller `SuperAdminTenants.jsx` and passed it down to `TenantsTable`.

---

## Summary of Achievements

1. **Safety & Robustness Guaranteed**: Decoupled circular module imports to ensure smooth dynamic rendering under Vite and React. The backend permission checks permit `super_admin` users platform-wide views. The React `EmptyState` fix prevents any crash upon backend API failures.
2. **Dynamic Navigation**: Every role (`super_admin`, `client_admin`, `executive`, `supervisor`, `staff`) now correctly lands on their tailored dashboard layout.
3. **No Unwanted Integration**: All modifications were targeted within the existing dashboard files without intrusive settings/base alterations, leaving full control to you.
