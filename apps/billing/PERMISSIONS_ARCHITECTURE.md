# Billing Permission Architecture

## Overview

This document describes the permission system for the billing app, which follows the same pattern as the accounts app but with billing-specific permission classes. The system implements Role-Based Access Control (RBAC) with a **super_admin override pattern** that ensures super admin users always have access to all resources.

## Key Principle: SUPER_ADMIN OVERRIDE

**Every permission class checks for super_admin status FIRST before checking role hierarchy.**

This is the critical pattern that ensures super_admin users bypass all restrictions:

```python
# Backend Pattern (apps/billing/api/v1/permissions/billing.py)
class CanAccessBillingAdmin(BasePermission):
    def has_permission(self, request, view):
        # ✅ SUPER_ADMIN OVERRIDE - Check first
        if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
            return True
        # Then check role hierarchy
        return other_role_checks()

# Frontend Pattern (frontend/src/hooks/billing/useBillingPermissions.js)
const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;
const canAccessAdminPanel = isSuperAdmin; // Direct return for critical permissions
```

## Backend Architecture

### Directory Structure

```
apps/billing/api/v1/permissions/
├── __init__.py           # Re-exports all permission classes
├── base.py               # Base permission classes (AllowAny, IsAuthenticated, etc.)
├── roles.py              # Role-based permissions (IsSuperAdmin, IsClientAdmin, etc.)
└── billing.py            # Billing-specific permissions (CanAccessBillingAdmin, etc.)
```

### Permission Classes

#### Base Permissions (`base.py`)
- `BasePermission`: Base class for all billing permissions
- `AllowAny`: Allow public access
- `IsAuthenticated`: Require authentication
- `IsAuthenticatedOrReadOnly`: Allow reads publicly, writes require auth

#### Role-Based Permissions (`roles.py`)
- `HasRole(role)`: Generic role check with super_admin override
- `HasAnyRole(roles)`: Check if user has any of multiple roles
- `IsSuperAdmin`: Super admin only (checks both `role` and `is_superuser`)
- `IsClientAdmin`: Client admin and above (cascades to super_admin)
- `IsExecutive`: Executive and above
- `IsSupervisor`: Supervisor role
- `IsStaff`: Staff role
- `IsDashboardChampion`: Dashboard champion role

**Critical**: Each class implements `has_permission()` and `has_object_permission()` with:
1. Early return for `super_admin` (override pattern)
2. Then role hierarchy checks
3. Finally tenant isolation checks

#### Billing-Specific Permissions (`billing.py`)

| Permission | Purpose | Super Admin | Role Hierarchy |
|-----------|---------|-------------|-----------------|
| `CanViewBilling` | View billing data | ✅ Override | CLIENT_ADMIN, EXECUTIVE, DASHBOARD_CHAMPION |
| `CanManageSubscriptions` | Manage subscriptions | ✅ Override | CLIENT_ADMIN |
| `CanViewInvoices` | View invoices | ✅ Override | All authenticated users |
| `CanMakePayment` | Make payments | ✅ Override | All authenticated users |
| `CanViewTransactions` | View transaction history | ✅ Override | CLIENT_ADMIN, EXECUTIVE, DASHBOARD_CHAMPION |
| `CanViewPlans` | View plans | N/A | Public (anyone) |
| `CanManagePaymentMethods` | Manage payment methods | ✅ Override | All authenticated users |
| `CanViewBillingAnalytics` | View analytics | ✅ Override | CLIENT_ADMIN, EXECUTIVE |
| `CanInitiateRefund` | Create refunds | ✅ ONLY SUPER_ADMIN | None (super_admin only) |
| `CanAccessBillingAdmin` | Access admin panel | ✅ ONLY SUPER_ADMIN | None (super_admin only) |
| `CanManagePlans` | Manage subscription plans | ✅ ONLY SUPER_ADMIN | None (super_admin only) |
| `CanManageBillingSettings` | Manage billing settings | ✅ ONLY SUPER_ADMIN | None (super_admin only) |

### Important Implementation Details

#### Tenant Isolation
All object-level permissions check tenant isolation:
```python
def has_object_permission(self, request, view, obj):
    # Check tenant isolation
    if hasattr(obj, 'tenant_id'):
        if str(obj.tenant_id) != str(request.user.tenant_id):
            return False
    return self.has_permission(request, view)
```

#### Role Hierarchy
Roles cascade permissions to higher-level roles:
```python
isSuperAdmin = True → has all permissions
isClientAdmin = True → has CLIENT_ADMIN permissions + EXECUTIVE + DASHBOARD_CHAMPION
isExecutive = True → has EXECUTIVE permissions + DASHBOARD_CHAMPION
```

## Frontend Architecture

### Hook: `useBillingPermissions()`

**Location**: `frontend/src/hooks/billing/useBillingPermissions.js`

**Purpose**: Derive permission flags from Redux auth state, mirrors backend permission logic

**Usage**:
```javascript
import { useBillingPermissions } from '../hooks/billing/useBillingPermissions';

function MyComponent() {
    const { permissions, user, isSuperAdmin } = useBillingPermissions();
    
    if (!permissions.canAccessAdminPanel) {
        return <AccessDenied />;
    }
    
    return <AdminPanel />;
}
```

### State Flow

1. **Backend Login**: User authenticates, receives `user` object with `role` and `is_superuser`
2. **Redux Storage**: `authSlice` stores user in Redux state
3. **Hook Extraction**: `useBillingPermissions()` reads `user` from Redux
4. **Permission Derivation**: Hook computes permission flags
5. **Component Check**: Component uses permission flag to render or deny access

### Critical Permission Flags

```javascript
// Super Admin Override - checked FIRST
const isSuperAdmin = role === 'super_admin' || user?.is_superuser === true;

// Critical permissions (super_admin only)
canAccessAdminPanel: isSuperAdmin,      // Guards AdminBillingDashboard
canManagePlans: isSuperAdmin,
canManageBillingSettings: isSuperAdmin,
canRefundTransactions: isSuperAdmin,

// Role hierarchy permissions
canViewBilling: isSuperAdmin || isClientAdmin || isExecutive || isDashboardChampion,
canManageSubscriptions: isSuperAdmin || isClientAdmin,
```

## Fixed Issue: Admin Dashboard Permission Denial

### Problem
AdminBillingDashboard showed "Access Denied" even for super_admin users.

### Root Cause
The backend permissions weren't consistently applying the super_admin override pattern. The `CanAccessBillingAdmin` permission class didn't exist, and other classes weren't checking `is_superuser` flag properly.

### Solution Implemented

1. **Backend**: Created structured permissions directory mirroring accounts app
   - Each permission class now checks: `if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN: return True`
   - Added `CanAccessBillingAdmin` specifically for admin panel access
   - Applied pattern consistently across all billing permission classes

2. **Frontend**: Updated `useBillingPermissions()` hook
   - Changed `canAccessAdminPanel` to directly check `isSuperAdmin`
   - Fixed role checks to properly read from Redux state
   - Added comprehensive comments explaining the backend pattern

3. **Component**: Verified AdminBillingDashboard uses correct permission:
   ```javascript
   if (!permissions.canAccessAdminPanel) {
       return <EmptyState type="default" title="Access Denied" ... />;
   }
   ```

## Testing the Fix

### Backend Permission Test

```bash
# Create a super_admin user
python manage.py shell
from apps.accounts.models import User
from apps.accounts.constants import UserRoles

user = User.objects.create(
    email='admin@example.com',
    role=UserRoles.SUPER_ADMIN,
    is_superuser=True
)

# Test permission in view
from apps.billing.api.v1.permissions import CanAccessBillingAdmin
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/billing/admin/')
request.user = user

perm = CanAccessBillingAdmin()
assert perm.has_permission(request, None) == True  # Should pass
```

### Frontend Permission Test

```javascript
// Test useBillingPermissions with super_admin user
import { useBillingPermissions } from './useBillingPermissions';
import { useSelector } from 'react-redux';

// Mock Redux state
jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

useSelector.mockReturnValue({
    user: {
        id: '123',
        email: 'admin@example.com',
        role: 'super_admin',
        is_superuser: true,
        tenant_id: 'tenant-1'
    },
    isAuthenticated: true
});

const { permissions } = useBillingPermissions();
expect(permissions.canAccessAdminPanel).toBe(true);  // Should pass
```

## Migration from Old Permissions.py

The old `apps/billing/api/v1/permissions.py` is maintained for backward compatibility. It now imports from the new structured directory:

```python
# apps/billing/api/v1/permissions.py (current)
from .permissions import (
    CanAccessBillingAdmin,
    CanManageSubscriptions,
    # ... other imports
)

# Any existing code that imports from here continues to work
from apps.billing.api.v1.permissions import CanAccessBillingAdmin
```

## Best Practices

1. **Always check super_admin first** in permission classes:
   ```python
   if request.user.is_superuser or request.user.role == UserRoles.SUPER_ADMIN:
       return True
   ```

2. **Use appropriate permission class for the endpoint**:
   - Public data: `AllowAny`, `CanViewPlans`
   - Authenticated users: `IsAuthenticated`, `CanMakePayment`
   - Admin-only: `CanAccessBillingAdmin`, `CanManagePlans`

3. **Implement has_object_permission() for multi-tenant safety**:
   - Check tenant_id matches user's tenant
   - Return True/False based on tenant isolation

4. **Frontend: Always read user from Redux state**:
   - Use `useSelector(selectAuth)` to get user
   - Check both `role` and `is_superuser` for super_admin

5. **Frontend: Mirror backend permission logic**:
   - Frontend `canAccessAdminPanel` should match backend `CanAccessBillingAdmin`
   - Use same super_admin override pattern
   - Add comments explaining backend correlation

## References

- Accounts app reference: `apps/accounts/api/v1/permissions/`
- Backend views: `apps/billing/api/v1/views/`
- Frontend components: `frontend/src/components/billing/`
- Redux auth state: `frontend/src/store/accounts/slice/authSlice.js`
- Role constants: `apps/accounts/constants.py` (UserRoles enum)
