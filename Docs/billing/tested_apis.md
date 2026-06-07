(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/test_parallel.py
================================================================================
BILLING API ENDPOINT TEST
================================================================================
Token obtained: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
Testing 21 endpoints with 8 workers
--------------------------------------------------------------------------------

================================================================================
RESULTS
================================================================================
✅ 200 - 8.923s - http://127.0.0.1:8000/api/v1/billing/plans/
✅ 200 - 4.85s - http://127.0.0.1:8000/api/v1/billing/plans/public/
✅ 200 - 9.037s - http://127.0.0.1:8000/api/v1/billing/plans/comparison/
✅ 200 - 9.671s - http://127.0.0.1:8000/api/v1/billing/subscriptions/
✅ 200 - 8.662s - http://127.0.0.1:8000/api/v1/billing/subscriptions/current/
✅ 200 - 9.498s - http://127.0.0.1:8000/api/v1/billing/invoices/
✅ 200 - 9.276s - http://127.0.0.1:8000/api/v1/billing/invoices/outstanding/
✅ 200 - 8.813s - http://127.0.0.1:8000/api/v1/billing/transactions/
✅ 200 - 6.492s - http://127.0.0.1:8000/api/v1/billing/transactions/summary/
✅ 200 - 6.234s - http://127.0.0.1:8000/api/v1/billing/payment-methods/
❌ 400 - 8.478s - http://127.0.0.1:8000/api/v1/billing/checkout/verify/
✅ 200 - 6.172s - http://127.0.0.1:8000/api/v1/billing/analytics/summary/
✅ 200 - 7.418s - http://127.0.0.1:8000/api/v1/billing/analytics/revenue/
✅ 200 - 8.09s - http://127.0.0.1:8000/api/v1/billing/analytics/subscriptions/
✅ 200 - 8.663s - http://127.0.0.1:8000/api/v1/billing/usage/summary/
✅ 200 - 8.417s - http://127.0.0.1:8000/api/v1/billing/usage/limits/
✅ 200 - 7.837s - http://127.0.0.1:8000/api/v1/billing/audit-logs/
✅ 200 - 8.186s - http://127.0.0.1:8000/api/v1/billing/audit-logs/summary/
✅ 200 - 7.799s - http://127.0.0.1:8000/api/v1/billing/portal/
✅ 200 - 6.592s - http://127.0.0.1:8000/api/v1/billing/webhook/paystack/
✅ 200 - 5.663s - http://127.0.0.1:8000/api/v1/billing/system-settings/
--------------------------------------------------------------------------------
SUMMARY: 20 OK, 1 FAILED, 0 ERRORS
Total time: 23.11s
================================================================================