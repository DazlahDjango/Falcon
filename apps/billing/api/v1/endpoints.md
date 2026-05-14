# Endpoints (Documentation reference)
"""
Billing API Endpoints Summary
==============================

Base URL: /api/v1/billing/

Authentication: JWT Token (Bearer) required for all endpoints except webhook

-------------------------------------------------------------------------------
PLANS (/plans)
-------------------------------------------------------------------------------

GET    /plans/                          - List all available plans
GET    /plans/{id}/                     - Get plan details
POST   /plans/compare/                  - Compare multiple plans
GET    /plans/{id}/features/            - Get features for a plan
GET    /plans/{id}/subscriptions/       - List subscriptions using this plan

-------------------------------------------------------------------------------
SUBSCRIPTIONS (/subscriptions)
-------------------------------------------------------------------------------

GET    /subscriptions/                  - List subscriptions (admin only)
GET    /subscriptions/current/          - Get current user's subscription
GET    /subscriptions/status/           - Get subscription status
POST   /subscriptions/                  - Create new subscription
GET    /subscriptions/{id}/             - Get subscription details
PUT    /subscriptions/{id}/             - Update subscription
PATCH  /subscriptions/{id}/             - Partial update
DELETE /subscriptions/{id}/             - Delete subscription
POST   /subscriptions/{id}/cancel/      - Cancel subscription
POST   /subscriptions/{id}/reactivate/  - Reactivate cancelled subscription
POST   /subscriptions/{id}/sync/        - Sync with Stripe
GET    /subscriptions/{id}/history/     - Get change history
GET    /subscriptions/{id}/invoices/    - List invoices for subscription
GET    /subscriptions/{id}/payments/    - List payments for subscription

-------------------------------------------------------------------------------
INVOICES (/invoices)
-------------------------------------------------------------------------------

GET    /invoices/                       - List invoices for tenant
GET    /invoices/outstanding/           - List outstanding invoices
GET    /invoices/{id}/                  - Get invoice details
GET    /invoices/{id}/download/         - Download invoice PDF
POST   /invoices/{id}/remind/           - Send payment reminder
GET    /invoices/{id}/line-items/       - List line items for invoice
GET    /invoices/{id}/payments/         - List payments for invoice

-------------------------------------------------------------------------------
PAYMENTS (/payments)
-------------------------------------------------------------------------------

GET    /payments/                       - List payments for tenant
GET    /payments/{id}/                  - Get payment details

-------------------------------------------------------------------------------
PAYMENT METHODS (/payment-methods)
-------------------------------------------------------------------------------

GET    /payment-methods/                - List payment methods
GET    /payment-methods/default/        - Get default payment method
GET    /payment-methods/expiring-soon/  - Get expiring payment methods
POST   /payment-methods/                - Add new payment method
GET    /payment-methods/{id}/           - Get payment method details
DELETE /payment-methods/{id}/           - Delete payment method
POST   /payment-methods/{id}/set_default/ - Set as default

-------------------------------------------------------------------------------
CHECKOUT (/checkout)
-------------------------------------------------------------------------------

POST   /checkout/                       - Create checkout session
GET    /checkout/session/               - Get checkout session details

-------------------------------------------------------------------------------
CUSTOMER PORTAL (/portal)
-------------------------------------------------------------------------------

POST   /portal/                         - Create customer portal session

-------------------------------------------------------------------------------
QUOTA (/quota)
-------------------------------------------------------------------------------

GET    /quota/                          - Get quota status
GET    /quota/limits/                   - Get quota limits
POST   /quota/refresh/                  - Refresh quota usage

-------------------------------------------------------------------------------
WEBHOOK (No Authentication)
-------------------------------------------------------------------------------

POST   /webhook/stripe/                 - Stripe webhook endpoint

-------------------------------------------------------------------------------
Response Codes
-------------------------------------------------------------------------------

200 - Success
201 - Created
204 - No Content
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
429 - Too Many Requests (Quota exceeded)
500 - Internal Server Error

-------------------------------------------------------------------------------
Rate Limits
-------------------------------------------------------------------------------
- Authenticated users: 200 requests/hour
- Anonymous: 50 requests/day
- Checkout: 10 requests/hour
- Subscription operations: 5 requests/minute
- Payment methods: 10 requests/hour
- Invoice downloads: 30 requests/hour
- Webhook: 1000 requests/hour
"""