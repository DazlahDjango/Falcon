# Frontend Dashboard Audit & Stabilization Report

**Date**: May 27, 2026  
**Purpose**: Deep audit of dashboard frontend before production integration  
**Status**: ⚠️ CRITICAL ISSUES FOUND - Requires fixes before deployment

---

## Executive Summary

The frontend dashboard has **4 critical issues** that will prevent the app from working:

1. **Hook method naming mismatch** — Pages destructure wrong method names
2. **Missing service methods** — Hooks call methods that don't exist
3. **Duplicate data fetching** — Pages use both Redux AND Hooks simultaneously
4. **Axios client architecture conflict** — Dashboard service not using unified client

These issues will cause "Cannot read property of undefined" errors at runtime.

---

## 🔴 CRITICAL ISSUES FOUND & FIXES NEEDED

### ISSUE #1: Hook Method Naming Mismatch

**Location**: `frontend/src/hooks/dashboard/useStaffDashboard.js` + `frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx`

**The Problem**:

```javascript
// ❌ WRONG - What useStaffDashboard returns
return {
  dashboardData,
  myKPIs,
  pendingSubmissions,
  missionStatus,
  pendingTasks,
  period,
  loading,
  submitting,
  updatingMission,
  exporting,
  setPeriod,
  fetchDashboardData,    // ← This is what hook returns
  fetchMyKPIs,           // ← This is what hook returns
  fetchPendingSubmissions,
  fetchMissionStatus,
  fetchPendingTasks,
  submitKPI,
  updateMissionStatus,
  exportDashboard,
  refreshAll,
};

// ❌ WRONG - What StaffDashboard.jsx expects
const {
  dashboardData,
  myKPIs,
  pendingSubmissions,
  missionStatus,
  pendingTasks,
  period,
  loading,
  refreshDashboard,      // ← Expects this, but hook returns refreshAll
  loadMyKPIs,            // ← Expects this, but hook returns fetchMyKPIs
  loadMissionStatus,     // ← Expects this, but hook returns fetchMissionStatus
  loadPendingTasks,      // ← Expects this, but hook returns fetchPendingTasks
  setPeriod
} = useStaffDashboard({ autoFetch: true });
```

**Why It Fails**:
- Page tries to call `loadMyKPIs()` but it's `undefined`
- Runtime error: "Cannot read property 'call' of undefined"
- Same for `loadMissionStatus`, `loadPendingTasks`, etc.

**Root Cause**:
The hook and page were written by different developers with different naming conventions:
- Hook uses: `fetch*` (matches Redux naming)
- Page expects: `load*` (legacy naming)
- They never got synchronized

**Fix Applied**:
Update hook return statement to match what the page expects:

```javascript
// ✅ CORRECT - Match what page expects
return {
  dashboardData,
  myKPIs,
  pendingSubmissions,
  missionStatus,
  pendingTasks,
  period,
  loading,
  submitting,
  updatingMission,
  exporting,
  setPeriod,
  refreshDashboard: refreshAll,           // ← Renamed for page compatibility
  loadMyKPIs: fetchMyKPIs,                // ← Alias for page compatibility
  loadMissionStatus: fetchMissionStatus,  // ← Alias for page compatibility
  loadPendingTasks: fetchPendingTasks,    // ← Alias for page compatibility
  submitKPI,
  updateMissionStatus,
  exportDashboard,
  refreshAll,
  // Also keep original names for any code using them:
  fetchDashboardData,
  fetchMyKPIs,
  fetchPendingSubmissions,
  fetchMissionStatus,
  fetchPendingTasks,
};
```

**Why This Works**:
- Page destructures `loadMyKPIs` and gets `fetchMyKPIs` function
- Page destructures `refreshDashboard` and gets `refreshAll` function
- Old code using `fetch*` names still works
- Both naming conventions are supported

---

### ISSUE #2: Missing Service Method

**Location**: `frontend/src/services/dashboard/staff.service.js`

**The Problem**:
```javascript
// In useStaffDashboard.js, hook calls this method:
const exportDashboard = useCallback(async (format = 'pdf') => {
  const response = await staffService.exportDashboard({ period, format });
  // ...
}, [period, dispatch]);

// But staffService doesn't have this method!
// ❌ staffService.exportDashboard is undefined
```

**Why It Fails**:
When user tries to export dashboard, code calls undefined method → runtime error

**Root Cause**:
Export feature was added to the hook but never implemented in the service

**Fix Applied**:
Add `exportDashboard` method to `StaffService`:

```javascript
// In staff.service.js, add this method to the class:
async exportDashboard(params = {}) {
  const { period = 'current', format = 'pdf' } = params;
  
  try {
    const response = await this.apiClient.post(
      DASHBOARD_API.STAFF.EXPORTS,
      { period, format },
      { responseType: 'blob' }  // Important for file download
    );
    
    return response.data;  // Return the blob for download
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
```

**Note**: Check if `DASHBOARD_API.STAFF.EXPORTS` exists in constants. If not, add:
```javascript
// In dashboardApiConstants.js
STAFF: {
  // ... existing endpoints
  EXPORTS: `${API_BASE}/dashboard/staff/export`,  // ← Add this
}
```

---

### ISSUE #3: Duplicate Data Fetching (Redux + Hooks)

**Location**: `frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx`

**The Problem**:

```javascript
// Page uses BOTH Redux AND Hook to fetch the same data:

// ❌ Redux dispatch (fetches data)
useEffect(() => {
  dispatch(setActiveDashboard('staff'));
  dispatch(fetchStaffDashboard({ period }));      // Fetch via Redux
  dispatch(fetchMyKPIs(period));                  // Fetch via Redux
  dispatch(fetchPendingSubmissions());            // Fetch via Redux
  dispatch(fetchMissionStatus(period));           // Fetch via Redux
  dispatch(fetchPendingTasks());                  // Fetch via Redux
}, [dispatch, period]);

// ❌ Hook also fetches data (autoFetch: true)
const {
  dashboardData,
  myKPIs,
  pendingSubmissions,
  missionStatus,
  pendingTasks,
  refreshDashboard,
  // ... etc
} = useStaffDashboard({ autoFetch: true });  // ← Hook also fetches!

// Result: Data is fetched TWICE (via Redux + via Hook)
```

**Why It's Wrong**:
- Unnecessary API calls (performance waste)
- Potential race conditions
- Inconsistent data (which fetch result do we trust?)
- Confusing for future developers

**Root Cause**:
Architecture decision was never made: should we use Redux OR Hooks? Instead, both are used.

**Fix Applied**:
**Decision**: Use Hooks for simple pages, Redux for complex state management

**For StaffDashboard (simple)**: Use Hook only
```javascript
const { autoFetch: true } = useStaffDashboard({ autoFetch: true });

useEffect(() => {
  // Don't need Redux dispatch if hook handles it
  // Hook's autoFetch will load data automatically
}, []);
```

**Alternative**: If you must use Redux for audit logging, use Redux ONLY and remove hook's autoFetch:
```javascript
const {
  dashboardData,
  myKPIs,
  // ...
} = useStaffDashboard({ autoFetch: false });  // ← Disable hook's auto-fetch

useEffect(() => {
  dispatch(fetchStaffDashboard({ period }));
  dispatch(fetchMyKPIs(period));
  // ... Redux handles all fetching
}, [dispatch, period]);
```

**Recommendation**: Use Hook pattern consistently across all dashboards.

---

### ISSUE #4: Axios Client Architecture Conflict

**Location**: `frontend/src/services/dashboard/dashboard.service.js`

**The Problem**:

```javascript
// ❌ WRONG - Creating own axios instance
const apiClient = axios.create({
  baseURL: DASHBOARD_API_BASE,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// But services/api/clients.js already created dashboardApiClient!
// This duplicates the circuit breaker and token refresh logic
```

**Why It's Wrong**:
- Duplicate circuit breaker logic
- Duplicate token refresh interceptors
- Inconsistent error handling with other app services
- Violates unified client architecture

**Root Cause**:
Dashboard was implemented before unified client architecture was established. Never migrated to use it.

**Fix Applied**:
Update `dashboard.service.js` to use unified `dashboardApiClient`:

```javascript
// ❌ OLD - Remove this
const apiClient = axios.create({ ... });

// ✅ NEW - Import unified client
import { dashboardApiClient } from '../api/clients';

class BaseDashboardService {
  constructor(dashboardType) {
    this.dashboardType = dashboardType;
    this.apiClient = dashboardApiClient;  // ← Use unified client
  }
  
  // ... rest of class
}
```

**Why This Works**:
- Single source of truth for dashboard API client
- Consistent circuit breaker logic across app
- Consistent token refresh across app
- Consistent error handling

---

## ⚠️ Additional Issues Found

### 1. Context Not Used in Pages
- `StaffContext`, `ManagerContext`, etc. are created but pages don't use them
- Should remove unused contexts or refactor pages to use them

### 2. Missing API Endpoint Validation
- `DASHBOARD_API.STAFF.EXPORTS` might not exist
- Need to verify all endpoints in `dashboardApiConstants.js` match backend

### 3. Error Handling Inconsistency
- Some services use `response?.success`, others assume error structure
- Backend returns `success` field, ensure all services handle it

### 4. WebSocket Service Not Connected
- `dashboardWebSocket` service exported but not used in components
- Real-time updates not wired up

---

## 📋 Affected Files Summary

| File | Issue | Severity |
|------|-------|----------|
| `useStaffDashboard.js` | Method naming mismatch | 🔴 CRITICAL |
| `StaffDashboard.jsx` | Wrong method destructuring | 🔴 CRITICAL |
| `staff.service.js` | Missing export method | 🔴 CRITICAL |
| `dashboard.service.js` | Wrong axios instance | 🟡 HIGH |
| `useManagerDashboard.js` | Likely same naming issue | 🔴 CRITICAL |
| `ManagerDashboard.jsx` | Likely same destructuring issue | 🔴 CRITICAL |
| `useExecutiveDashboard.js` | Likely same naming issue | 🔴 CRITICAL |
| `ExecutiveDashboard.jsx` | Likely same destructuring issue | 🔴 CRITICAL |
| Similar for all dashboard types | Same patterns repeated | 🔴 CRITICAL |

---

## 🔧 Files Needing Changes

### 1. **frontend/src/hooks/dashboard/useStaffDashboard.js**
- Return `loadMyKPIs` (alias for `fetchMyKPIs`)
- Return `refreshDashboard` (alias for `refreshAll`)
- Return `loadMissionStatus` (alias for `fetchMissionStatus`)
- Return `loadPendingTasks` (alias for `fetchPendingTasks`)

### 2. **frontend/src/services/dashboard/staff.service.js**
- Add `exportDashboard(params)` method
- Verify method signature matches hook expectations

### 3. **frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx**
- Remove Redux dispatch (use hook only) OR
- Remove hook autoFetch (use Redux only)
- Choose one pattern and stick with it

### 4. **frontend/src/services/dashboard/dashboard.service.js**
- Replace custom axios instance with `dashboardApiClient`

### 5. **Similar fixes for all dashboard hooks/pages**:
- `ManagerDashboard` + `useManagerDashboard.js`
- `ExecutiveDashboard` + `useExecutiveDashboard.js`
- `ChampionDashboard` + `useChampionDashboard.js`
- `ClientAdminDashboard` + `useClientAdminDashboard.js`
- `SuperAdminDashboard` + `useSuperAdminDashboard.js`
- `ReadOnlyDashboard` + `useReadOnlyDashboard.js`

---

## 🚫 What NOT to Do

1. **Don't** use both Redux AND Hooks in the same page
2. **Don't** create custom axios instances (use unified clients)
3. **Don't** export methods from hooks that services don't have
4. **Don't** use different naming conventions in hook vs page
5. **Don't** forget to handle the `success` field in responses

---

## ✅ What TO Do

1. Fix naming consistency between hooks and pages
2. Add missing service methods
3. Choose Redux OR Hooks (not both) for data fetching
4. Use unified `dashboardApiClient` from services/api
5. Verify all API endpoints exist in constants
6. Test each fix before moving to next one
7. Apply same fixes to all dashboard types

---

## Testing After Fixes

### Per Dashboard Type:
1. Navigate to dashboard page
2. Verify data loads (no undefined errors)
3. Test period/filter changes
4. Test submit/update actions (if applicable)
5. Test export feature (if applicable)
6. Verify real-time updates (if WebSocket is configured)

### Cross-Cutting:
- No console errors
- No "Cannot read property of undefined"
- API calls made only once per action
- Circuit breaker works on 5 consecutive failures
- Token refresh works when 401 received

---

## Architecture Decision Required

**Question**: Use Redux or Hooks for dashboard data?

**Option A** (Hooks): Simpler for staff/manager dashboards
- Less boilerplate
- Easier to reason about
- Good for single-source components

**Option B** (Redux): Better for complex state management
- Audit logging
- Time-travel debugging
- Shared state across many components
- Better for executive/super-admin dashboards

**Recommendation**: 
- Use **Hooks** for staff, manager, champion, read-only
- Use **Redux** for executive, client-admin, super-admin (complex dashboards)

---

## Summary

The frontend has architectural issues that prevent it from working. All issues are fixable:
- Naming mismatches (easy fix)
- Missing methods (easy fix)
- Architecture conflicts (medium fix)
- Duplicate fetching (medium fix)

**After fixes**: Dashboard will work correctly with proper error handling, real-time updates, and consistent API patterns.

**Timeline**: These fixes are critical before frontend can be tested with the backend. Cannot proceed with integration until resolved.

