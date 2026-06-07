Accounts:
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/test_websocket_accounts.py
============================================================
ACCOUNTS WEB SOCKET TEST
============================================================
Login status: 200
✓ Token obtained: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
✓ Tenant ID: 30295944-7c86-458d-b8cb-9458bc67aa6b
============================================================

🔌 TEST 1: Authentication WebSocket
----------------------------------------
Connecting to: ws://127.0.0.1:8000/ws/auth/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODI4LCJpYXQiOjE3ODA3NTkwMjgsImp0aSI6IjA0MjZkYzZkNDRmZjQ2ZDZiMTkyNWRlZjMzMWRmZmFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.SLyDU6XpNAATXi6l2iAVenz1WSrvIp0bOXBww0FfM4A
❌ Auth WS Error: Handshake status 403 Access denied -+-+- {} -+-+- None
🔌 Auth WS Closed: None - None

🔌 TEST 2: Presence WebSocket
----------------------------------------
Connecting to: ws://127.0.0.1:8000/ws/presence/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODI4LCJpYXQiOjE3ODA3NTkwMjgsImp0aSI6IjA0MjZkYzZkNDRmZjQ2ZDZiMTkyNWRlZjMzMWRmZmFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.SLyDU6XpNAATXi6l2iAVenz1WSrvIp0bOXBww0FfM4A
❌ Presence WS Error: Handshake status 403 Access denied -+-+- {} -+-+- None
🔌 Presence WS Closed: None - None

🔌 TEST 3: Notification WebSocket
----------------------------------------
Connecting to: ws://127.0.0.1:8000/ws/notifications/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODI4LCJpYXQiOjE3ODA3NTkwMjgsImp0aSI6IjA0MjZkYzZkNDRmZjQ2ZDZiMTkyNWRlZjMzMWRmZmFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.SLyDU6XpNAATXi6l2iAVenz1WSrvIp0bOXBww0FfM4A

============================================================
🚀 Running WebSocket tests for 15 seconds...
============================================================
❌ Notification WS Error: Handshake status 403 Access denied -+-+- {} -+-+- None
🔌 Notification WS Closed: None - None

🔌 Disconnecting all WebSockets...

============================================================
TEST SUMMARY
============================================================

📊 Auth WebSocket: 0 messages received
📊 Presence WebSocket: 0 messages received
📊 Notification WebSocket: 0 messages received

⚠️ No messages received. Check if Daphne server is running.

============================================================
TEST COMPLETE
============================================================


KPIs
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/test_websocket_kpi.py
Login status: 200
✓ Token obtained: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
✓ Tenant ID: 30295944-7c86-458d-b8cb-9458bc67aa6b
✓ User ID: abfb08ee-6f1f-4231-a8a6-e122175825b1
============================================================

============================================================
KPI WEBSOCKET ENDPOINT TEST
============================================================

📡 TEST 1: Dashboard WebSocket

🔌 Testing Dashboard WebSocket: ws://127.0.0.1:8000/ws/kpi/dashboard/abfb08ee-6f1f-4231-a8a6-e122175825b1/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Dashboard error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Dashboard closed: None

📡 TEST 2: Admin WebSocket

🔌 Testing Admin WebSocket: ws://127.0.0.1:8000/ws/kpi/admin/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Admin error: Handshake status 500 Internal server error -+-+- {} -+-+- None
  🔌 Admin closed: None

📡 TEST 3: Team WebSocket

🔌 Testing Team WebSocket (manager: abfb08ee-6f1f-4231-a8a6-e122175825b1): ws://127.0.0.1:8000/ws/kpi/team/abfb08ee-6f1f-4231-a8a6-e122175825b1/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Team error: Handshake status 500 Internal server error -+-+- {} -+-+- None
  🔌 Team closed: None

📡 TEST 4: Executive WebSocket

🔌 Testing Executive WebSocket: ws://127.0.0.1:8000/ws/kpi/executive/30295944-7c86-458d-b8cb-9458bc67aa6b/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Executive error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Executive closed: None

📡 TEST 5: Notification WebSocket

🔌 Testing Notification WebSocket: ws://127.0.0.1:8000/ws/kpi/notifications/abfb08ee-6f1f-4231-a8a6-e122175825b1/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Notification error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Notification closed: None

📡 TEST 6: Score WebSocket

🔌 Testing Score WebSocket: ws://127.0.0.1:8000/ws/kpi/scores/abfb08ee-6f1f-4231-a8a6-e122175825b1/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Score error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Score closed: None

📡 TEST 7: Validation WebSocket

🔌 Testing Validation WebSocket: ws://127.0.0.1:8000/ws/kpi/validation/abfb08ee-6f1f-4231-a8a6-e122175825b1/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Validation error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Validation closed: None

📡 TEST 8: Analytics WebSocket

🔌 Testing Analytics WebSocket: ws://127.0.0.1:8000/ws/kpi/analytics/30295944-7c86-458d-b8cb-9458bc67aa6b/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Analytics error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Analytics closed: None

📡 TEST 9: Alerts WebSocket

🔌 Testing Alerts WebSocket: ws://127.0.0.1:8000/ws/kpi/alerts/30295944-7c86-458d-b8cb-9458bc67aa6b/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwODg4LCJpYXQiOjE3ODA3NTkwODgsImp0aSI6IjZhZTYxOGQxMTFiNzRjZGY4OWQ1MTRlNjA1NDBhOTFhIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.qZV5bRUtbZX2dqrwlz4yDUWgF-7U8WzArWIQqaR9PSI
  ❌ Alert error: Handshake status 403 Access denied -+-+- {} -+-+- None
  🔌 Alert closed: None

============================================================
WEBSOCKET TEST SUMMARY
============================================================
  ✅ Dashboard WebSocket: Connected=True
  ✅ Admin WebSocket: Connected=True
  ✅ Team WebSocket: Connected=True
  ✅ Executive WebSocket: Connected=True
  ✅ Notification WebSocket: Connected=True
  ✅ Score WebSocket: Connected=True
  ✅ Validation WebSocket: Connected=True
  ✅ Analytics WebSocket: Connected=True
  ✅ Alerts WebSocket: Connected=True

📊 Summary: 9/9 WebSocket endpoints connected successfully
============================================================

Billing:
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/test_websocket.py
Login status: 200
✓ Token obtained: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
✓ Tenant ID: 30295944-7c86-458d-b8cb-9458bc67aa6b
============================================================

Connecting to: ws://127.0.0.1:8000/ws/billing/30295944-7c86-458d-b8cb-9458bc67aa6b/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzYwOTk5LCJpYXQiOjE3ODA3NTkxOTksImp0aSI6ImJkNDRiYjhhMDczYzRlN2ViZjQwODIyNDM3MTM1NGE5IiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.jTqCf-R9c4cHt5FbsBpFuYt03p1eH0lg7XqhyLnu8Oc

🚀 Running WebSocket test for 10 seconds...
============================================================
✅ WebSocket connected!

📤 Sending ping...
📤 Requesting subscription status...
📤 Requesting recent transactions...
📥 Received: {"type": "initial_state", "data": {"subscription": {"id": "a45b38da-0b64-4bb6-a8a9-cda507fcd8bb", "subscription_code": "SUB_TEST_12345", "plan_name": "Professional", "plan_type": "professional", "status": "active", "amount": 250000, "currency": "KES", "current_period_end": "2027-05-17T15:09:16.018000+00:00", "is_active": true, "is_on_trial": false, "trial_days_remaining": 0, "days_until_expiry": 344, "auto_renew": true, "cancel_at_period_end": false}, "recent_transactions": [{"id": "cffaedfb-967d-40f9-bab3-32a5ae1d3501", "reference": "SUB-20260604194504-1D6925129503", "transaction_type": "subscription", "amount": 500000, "total_amount": 580800, "currency": "KES", "status": "success", "payment_date": "2026-06-04T19:47:35+00:00", "created_at": "2026-06-04T19:45:04.002926+00:00"}, {"id": "1af5f43d-3ff6-463a-acc7-7e3d7cff06fd", "reference": "SUB-20260604194108-AB8413D65F8E", "transaction_type": "subscription", "amount": 500000, "total_amount": 580800, "currency": "KES", "status": "pending", "payment_date": null, "created_at": "2026-06-04T19:41:08.243536+00:00"}, {"id": "196388cd-431e-468d-ae74-4a4621e10513", "reference": "SUB-20260604192755-8EE1AD815130", "transaction_type": "subscription", "amount": 500000, "total_amount": 580800, "currency": "KES", "status": "pending", "payment_date": null, "created_at": "2026-06-04T19:27:55.765425+00:00"}], "pending_invoices": [], "timestamp": "2026-06-06 15:19:59.762486+00:00"}}
❌ Error: fin=1 opcode=8 data=b'\x03\xf3'
🔌 Connection closed: None - None