# Accounts Application - Celery Tasks Findings

## 1. Overview & Architecture
The `accounts` async background tasks (`apps/accounts/tasks.py`) process background identity and security jobs:
- `send_verification_email_task(user_id)`: Dispatches email verification links via SMTP/SendGrid.
- `send_password_reset_email_task(user_id, token)`: Sends secure password reset tokens.
- `cleanup_expired_sessions_task()`: Periodic Celery Beat task purging revoked/expired sessions from DB.
- `rotate_security_keys_task()`: Periodic maintenance task rotating internal encryption keys.

---

## 2. Ratings Across 12 Standard Criteria

| Criterion | Rating | Analysis & Justification |
| :--- | :---: | :--- |
| **1. Solidity** | **9.0/10** | Retries transactional email tasks with exponential backoff (`max_retries=5`, `default_retry_delay=60`). |
| **2. Security** | **9.2/10** | Tokens sent in emails are single-use, time-bound hashes. |
| **3. Cleanliness** | **9.0/10** | Tasks call dedicated service objects (`EmailService`, `SessionService`). |
| **4. Dependencies & Imports** | **9.0/10** | Uses Celery `@shared_task` decorator. |
| **5. CIA Triad Implementation** | **9.0/10** | Ensures non-blocking HTTP requests for transactional emails and background session pruning. |
| **6. Isolations & DB Routing** | **8.8/10** | Global tasks execute in public schema context as required for account management. |
| **7. Production Failure Risk** | **8.8/10** | Email task failure triggers retry without dropping registration state. |
| **8. Hosting Reliability** | **9.0/10** | Mapped to `accounts_emails` and `accounts_maintenance` Celery queues. |
| **9. Inter-App Compatibility** | **9.0/10** | Seamlessly used across user registration and password recovery flows. |
| **10. Caching Strategies** | **8.8/10** | Leverages Redis task queue. |
| **11. Optimization & Performance**| **9.0/10** | Fast execution; offloads IO-heavy email delivery out of HTTP response window. |
| **12. Bugs & Fixes** | **9.0/10** | Production-ready execution. |

**Overall Accounts Tasks Score**: **9.0 / 10**
