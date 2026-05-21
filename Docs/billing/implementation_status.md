# Falcon PMS Billing App — Implementation Status

**Last updated:** May 2026

## Frontend routing (fixed)

Billing now uses a **unified module shell** like Config:

| Before | After |
|--------|-------|
| `/app/billing/...` scattered paths | `/billing/...` canonical tree |
| `/app/admin/billing/...` | `/billing/admin/...` |
| `/app/reports/billing/...` | `/billing/reports/...` |
| Broken links (`/checkout`, `/invoices/1`) | All navigation uses `billingRouteConstants.js` |
| No sub-nav in browser | `BillingShell` + sidebar + breadcrumbs |

**Entry:** `/billing` → `/billing/portal`

Legacy `/app/billing/*` URLs redirect automatically.

## Backend

- `BillingSystemSettings` + `BillingSettingsService`
- `GET/PATCH /api/v1/billing/system-settings/`
- `python manage.py seed_billing_settings [--reset]`

## CIA (registry)

Billing is **critical** in `V1_APP_DEFINITIONS`, depends on `accounts` + `tenant`.

## Next

- Wire `BillingEventBroadcaster` to subscription/transaction signals
- Live MRR sync from transactions (real-change analytics)
