# Accounts Frontend Module - Master 10/10 Upgrade & Fixes Blueprint

## Executive Overview
This document specifies the exact code standardization, API contract alignment, and clean-code implementation steps for the `accounts` frontend module (`frontend/src/`) to ensure complete compatibility with the backend Django REST v1 APIs listed in [urls_apis.md](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/Docs/frontend/accounts/urls_apis.md).

---

## 1. Clean Code Directives (User Directives)
- **Zero Redundant Comments**: Keep code clean, concise, and professional without cluttering source files with unnecessary inline commentary.
- **Strict Parity**: All API calls must route through endpoint constants defined in `accountsApiConstants.js`.
- **Stateless & Scalable**: Preserve Redux Toolkit state immutability and Reselect memoization patterns.

---

## 2. Upgrade Action Plan by Layer

### Layer 1: API Constants (`accountsApiConstants.js`)
- **Action**: Ensure all backend endpoints from `urls_apis.md` are explicitly represented in `ACCOUNTS_API_BASE` objects (`AUTH_ENDPOINTS`, `USER_ENDPOINTS`, `PROFILE_ENDPOINTS`, `MFA_DEVICE_ENDPOINTS`, `ROLE_ENDPOINTS`, `PERMISSION_ENDPOINTS`, `SESSION_ENDPOINTS`, `AUDIT_LOG_ENDPOINTS`, `REPORT_ENDPOINTS`, `PREFERENCE_ENDPOINTS`, `SECURITY_ENDPOINTS`, `ADMIN_ENDPOINTS`).

### Layer 2: API Services Layer (`frontend/src/services/accounts/api/*.js`)
- **Action**: Verify Axios service methods parse response envelopes (`response.data`) consistently and attach `X-Tenant-ID` headers where appropriate.

### Layer 3: Redux Store (`frontend/src/store/accounts/`)
- **Action**: Ensure all thunks handle errors cleanly via `rejectWithValue(error.response?.data)` and update normalized state properties.

### Layer 4: Custom Hooks (`frontend/src/hooks/accounts/`)
- **Action**: Wrap actions in `useCallback` to prevent unnecessary component re-renders during state changes.

### Layer 5: Components, Pages & Routes (`components/accounts/`, `pages/accounts/`, `routes/accounts.routes.jsx`)
- **Action**: Verify prop passing, loading state spinners, and `PrivateRoute` guards.
