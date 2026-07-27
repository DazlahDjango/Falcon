# 🦅 Falcon Frontend Billing System — Full Technical Findings Report

> **Date:** 2026-07-19  
> **Reviewed By:** Antigravity AI  
> **Scope:** `frontend/src/` — Config Constants, Services, Store (Redux), Hooks, Contexts, Components  
> **Target Alignment:** Django Backend `apps/billing/` (API v1 REST & WebSocket)

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Area 1: Config & Constants Audit](#2-area-1-config--constants-audit)
3. [Area 2: Services Layer Audit](#3-area-2-services-layer-audit)
4. [Area 3: Redux Store, Slices & Selectors Audit](#4-area-3-redux-store-slices--selectors-audit)
5. [Area 4: Hooks Layer Audit](#5-area-4-hooks-layer-audit)
6. [Area 5: Contexts Layer Audit](#6-area-5-contexts-layer-audit)
7. [Area 6: Components & UI Layer Audit](#7-area-6-components--ui-layer-audit)
8. [Security & CIA Triad Implementation Audit](#8-security--cia-triad-implementation-audit)
9. [Ratings (0 to 10 Scale)](#9-ratings-0-to-10-scale)
10. [Critical Issues & Bugs Summary](#10-critical-issues--bugs-summary)
11. [Recommended Implementation Plan](#11-recommended-implementation-plan)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FALCON FRONTEND BILLING ARCHITECTURE                 │
├───────────────┬───────────────┬───────────────┬─────────────────────────┤
│    config/    │   services/   │     store/    │        contexts/        │
│  (Constants)  │ (API Clients) │(Redux Slices) │    (Providers & WS)     │
├───────────────┴───────────────┴───────────────┴─────────────────────────┤
│    hooks/     │  components/  │  pages/views  │       security/         │
│ (Custom Hooks)│ (Billing UI)  │ (Portal/Plans)│ (Role/Tenant Guards)    │
└─────────────────────────────────────────────────────────────────────────┘
```

The Falcon Frontend Billing Module is built on React, Redux Toolkit, Context API, Axios (with custom envelope interceptors), and WebSockets via Django Channels.

---

## 2. Area 1: Config & Constants Audit

**Files Inspected:**
- `src/config/constants/billingApiConstants.js`
- `src/config/constants/billingConstants.js`
- `src/config/constants/billingRouteConstants.js`
- `src/config/constants/billingValidationConstants.js`

### Findings:
1. **Missing Subscription Endpoints:** `SUBSCRIPTION_ENDPOINTS` is missing `INVOICES: (id) => 'subscriptions/' + id + '/invoices/'` and `TRANSACTIONS: (id) => 'subscriptions/' + id + '/transactions/'`.
2. **Mismatched Admin Routes:** `ADMIN_BILLING_ENDPOINTS` defines `/admin/tenants/${tenantId}/subscriptions/`, `/admin/reports/revenue/`, etc. These routes do not exist on `/api/v1/billing/` in the Django backend.
3. **Correct Base Prefix:** `BILLING_API_PREFIX` is set to `/api/v1/billing`, matching Django's `urls.py`.

---

## 3. Area 2: Services Layer Audit

**Files Inspected:**
- `src/services/billing/BillingBaseService.js`
- `src/services/billing/SubscriptionService.js`
- `src/services/billing/PlanService.js`
- `src/services/billing/CheckoutService.js`
- `src/services/billing/InvoiceService.js`
- `src/services/billing/TransactionService.js`
- `src/services/billing/AdminBillingService.js`
- `src/services/billing/websocket.service.js`

### Findings:
1. **Runtime Error in `SubscriptionService.js`:**
   - `getSubscriptionInvoices(id)` calls `SUBSCRIPTION_ENDPOINTS.INVOICES(id)`, throwing `TypeError: SUBSCRIPTION_ENDPOINTS.INVOICES is not a function`.
   - `getSubscriptionTransactions(id)` calls `SUBSCRIPTION_ENDPOINTS.TRANSACTIONS(id)`, throwing `TypeError: SUBSCRIPTION_ENDPOINTS.TRANSACTIONS is not a function`.
2. **Property Name Mismatch in `hasActiveSubscription()`:**
   - `SubscriptionService.hasActiveSubscription()` checks `subscription?.data?.is_active === true`.
   - In Django `SubscriptionSerializer`, `is_active` is inside `is_active_status.is_active`. `subscription.data.is_active` is `undefined`, so `hasActiveSubscription()` always returns `false`.
3. **Envelope Unwrapping Compatibility:**
   - `BillingBaseService.js` unwraps `{ success: true, data: ... }` envelope objects. This aligns with `billingApiClient` response interceptors.

---

## 4. Area 3: Redux Store, Slices & Selectors Audit

**Files Inspected:**
- `src/store/index.js` & `src/store/rootReducer.js`
- `src/store/billing/slices/*`
- `src/store/billing/selectors/*`
- `src/store/billing/middleware/*`

### Findings:
1. **Correct Root Assembly:** `rootReducer.js` mounts `billingReducer` under key `billing`.
2. **Persistence Safeguard:** `store/index.js` blacklists `billing` from `redux-persist` whitelist, ensuring real-time server data is fetched on refresh rather than stale cached tokens.
3. **Selector Accuracy:** `subscriptionSelectors.js` properly extracts nested properties `sub?.is_active_status?.is_active` and `sub?.is_active_status?.trial_days_remaining`.

---

## 5. Area 4: Hooks Layer Audit

**Files Inspected:**
- `src/hooks/billing/useSubscription.js`
- `src/hooks/billing/useCheckout.js`
- `src/hooks/billing/usePlans.js`
- `src/hooks/billing/useInvoices.js`
- `src/hooks/billing/useTransactions.js`

### Findings:
1. **Ref Fetching Lock:** `useSubscription.js` uses `useRef(false)` for `hasFetched`. Switching tenants does not trigger a re-fetch unless `clearCurrentSubscription()` is dispatched on tenant change.
2. **Clean Redux Wrappers:** Custom hooks wrap Redux dispatchers cleanly, managing thunk pending/fulfilled/rejected states properly.

---

## 6. Area 5: Contexts Layer Audit

**Files Inspected:**
- `src/contexts/billing/SubscriptionContext.jsx`
- `src/contexts/billing/BillingContext.jsx`
- `src/contexts/billing/CheckoutContext.jsx`
- `src/contexts/billing/BillingWebSocketContext.jsx`

### Findings:
1. **Argument Count Mismatch in `SubscriptionContext.jsx`:**
   - `handleAutoRenewToggle = async (value) => { await updateSettings(value); await refresh(); }`
   - `updateSettings` in `useSubscription.js` expects `(id, autoRenewValue)`.
   - Passing `updateSettings(value)` sends `value` (boolean) as `id` and `undefined` as `autoRenewValue`, dispatching an invalid payload `{ id: true, autoRenew: undefined }` to Redux.
2. **WebSocket Integration:** `BillingWebSocketContext.jsx` manages WebSocket subscriptions dynamically per tenant.

---

## 7. Area 6: Components & UI Layer Audit

**Files Inspected:**
- `src/components/billing/subscription/SubscriptionDetails.jsx`
- `src/components/billing/subscription/UpgradeDowngradeModal.jsx`
- `src/components/billing/subscription/TrialBanner.jsx`
- `src/components/billing/plans/*`
- `src/components/billing/invoices/*`

### Findings:
1. **Reference Error in `SubscriptionDetails.jsx`:**
   - Line 49: `<TrialBanner daysRemaining={trialDaysRemaining} onUpgrade={() => setUpgradeModal(true)} />`
   - The state variable name is `showUpgradeModal`, NOT `upgradeModal`. `setUpgradeModal` is undefined, throwing `ReferenceError: setUpgradeModal is not defined` when clicking "Upgrade Now" on the trial banner.
2. **JSX Component Invoked as Plain Function in `UpgradeDowngradeModal.jsx`:**
   - Lines 49, 50, 73, 95, 96, 97: `CurrencyFormatter({ amount: additional, currency: subscription.currency })`
   - `CurrencyFormatter` is a React JSX component. Invoking it as a plain JS function inside template literals produces string representation `[object Object]` in the UI.

---

## 8. Security & CIA Triad Implementation Audit

| Metric | Status | Findings |
|---|---|---|
| **Confidentiality** | ✅ GOOD | `attachTenantHeader` automatically injects `X-Tenant-ID` and JWT `Authorization` header on API calls. |
| **Integrity** | ⚠️ NEEDS FIX | Front-end validation bugs (e.g. `updateSettings(value)` missing `id`) can cause invalid API submissions. |
| **Availability** | ✅ GOOD | `BillingBaseService` retries on network failures; WebSockets auto-reconnect cleanly. |

---

## 9. Ratings (0 to 10 Scale)

1. **Solidity (Code Architecture):** `8.0 / 10` — Well organized into Redux, hooks, contexts, and components.
2. **Scalability:** `8.5 / 10` — Clean separation of modular services and WebSockets.
3. **Customization:** `9.0 / 10` — Supports enterprise dynamic plans, custom branding, and custom limits UI.
4. **Portability with Existing Apps:** `8.5 / 10` — Integrates with `store/accounts` and `store/tenant`.
5. **Robustness & Reliability:** `7.5 / 10` — Deducted points for runtime reference errors (`setUpgradeModal`, missing endpoint helpers).
6. **Security:** `8.8 / 10` — Proper token storage, automatic header attachment, tenant scope enforcement.
7. **CIA Triad Implementation:** `8.5 / 10` — Secure storage and tenant context headers intact.
8. **Ease of Use:** `8.0 / 10` — UI design is rich, but minor component call bugs need cleanup.

---

## 10. Critical Issues & Bugs Summary

1. 🔴 **`SubscriptionDetails.jsx`**: `setUpgradeModal is not defined` when clicking trial banner upgrade button.
2. 🔴 **`UpgradeDowngradeModal.jsx`**: `CurrencyFormatter(...)` called as JS function inside template literals instead of JSX `<CurrencyFormatter />` or string formatter function.
3. 🔴 **`SubscriptionContext.jsx`**: `handleAutoRenewToggle` calls `updateSettings(value)` with missing `id` parameter.
4. 🔴 **`SubscriptionService.js`**: `hasActiveSubscription()` checks `subscription?.data?.is_active` instead of `subscription?.data?.is_active_status?.is_active`.
5. 🔴 **`billingApiConstants.js`**: Missing `INVOICES` and `TRANSACTIONS` functions in `SUBSCRIPTION_ENDPOINTS`.

---

## 11. Recommended Implementation Plan

1. **Fix Endpoint Constants & Services:** Add `INVOICES` and `TRANSACTIONS` to `SUBSCRIPTION_ENDPOINTS` in `billingApiConstants.js` and fix `is_active_status` check in `SubscriptionService.js`.
2. **Fix `SubscriptionContext.jsx` Parameters:** Pass `(subscription.id, value)` to `updateSettings` in `handleAutoRenewToggle`.
3. **Fix `SubscriptionDetails.jsx` & `UpgradeDowngradeModal.jsx` Component Bugs:** Correct state setter to `setShowUpgradeModal(true)` and use proper string currency formatting in `UpgradeDowngradeModal.jsx`.
