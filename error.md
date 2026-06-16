PS C:\Users\Dazlah Administrator> cd desktop/falcon_pms
PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> falc\scripts\activate
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> py manage.py makemigrations
{"time": "2026-06-15 19:17:39,647", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-15 19:17:41,973", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-15 19:17:42,347", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
No changes detected
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> py manage.py migrate
{"time": "2026-06-15 19:18:03,632", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-15 19:18:05,137", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-15 19:18:05,437", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
Operations to perform:
  Apply all migrations: accounts, admin, auditlog, auth, axes, billing, configs, contenttypes, core, dashboard, db, django_apscheduler, django_celery_beat, django_celery_results, guardian, kpi, otp_static, otp_totp, reviews, sessions, sites, structure, tenant, token_blacklist
Running migrations:
  No migrations to apply.
(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> py manage.py runserver

============================================================
Falcon PMS - Development server starting...

============================================================
Time: 2026-06-15 19:18:54
Python: 3.11.9
Project: C:\Users\Dazlah Administrator\Desktop
============================================================

{"time": "2026-06-15 19:18:57,098", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-15 19:18:58,610", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-15 19:18:58,875", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}

============================================================
Falcon PMS - Development server starting...

============================================================
Time: 2026-06-15 19:18:59
Python: 3.11.9
Project: C:\Users\Dazlah Administrator\Desktop
============================================================

{"time": "2026-06-15 19:19:02,322", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-15 19:19:03,697", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-15 19:19:03,949", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-06-15 19:19:04,067", "level": "INFO", "module": "autoreload", "message": "Watching for file changes with StatReloader"}
Performing system checks...

System check identified no issues (0 silenced).
June 15, 2026 - 19:19:08
Django version 5.2.12, using settings 'config.settings.development'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.

WARNING: This is a development server. Do not use it in a production setting. Use a production WSGI or ASGI server instead.
For more information on production servers see: https://docs.djangoproject.com/en/5.2/howto/deployment/
[KPI MIDDLEWARE] Processing request: /api/v1/auth/login/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:19:42,101", "level": "DEBUG", "module": "helpers", "message": "Using request.META.get('REMOTE_ADDR', None) fallback method to get client IP address"}
{"time": "2026-06-15 19:19:42,103", "level": "DEBUG", "module": "helpers", "message": "Using parameter credentials to get username with key settings.AXES_USERNAME_FORM_FIELD"}
{"time": "2026-06-15 19:19:42,106", "level": "DEBUG", "module": "database", "message": "AXES: Getting access attempts that are newer than 2026-06-15 16:04:42.101009+00:00"}
{"time": "2026-06-15 19:19:43,790", "level": "INFO", "module": "authentication", "message": "Completing authentication for user: laban@gmail.com"}
{"time": "2026-06-15 19:19:45,042", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-06-15 19:19:49,104", "level": "WARNING", "module": "event_broadcaster", "message": "Reviews WS broadcast failed (reviews_dashboard_30295944-7c86-458d-b8cb-9458bc67aa6b): Error 22 connecting to localhost:6379. The remote computer refused the network connection."}
{"time": "2026-06-15 19:19:49,118", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-06-15 19:19:53,181", "level": "WARNING", "module": "event_broadcaster", "message": "Reviews WS broadcast failed (reviews_dashboard_30295944-7c86-458d-b8cb-9458bc67aa6b): Error 22 connecting to localhost:6379. The remote computer refused the network connection."}
{"time": "2026-06-15 19:19:53,185", "level": "DEBUG", "module": "authentication", "message": "User login info updated"}
{"time": "2026-06-15 19:19:53,370", "level": "INFO", "module": "signals", "message": "Session created for user: laban@gmail.com from 127.0.0.1"}
{"time": "2026-06-15 19:19:53,513", "level": "DEBUG", "module": "authentication", "message": "Session created: b558445c-c902-4b09-85c2-6d3b8dac0f04"}
{"time": "2026-06-15 19:19:53,776", "level": "DEBUG", "module": "authentication", "message": "JWT tokens generated"}
{"time": "2026-06-15 19:19:53,855", "level": "DEBUG", "module": "authentication", "message": "Login attempt recorded"}
{"time": "2026-06-15 19:19:53,912", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.login for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:19:53,929", "level": "DEBUG", "module": "authentication", "message": "Audit log created"}
{"time": "2026-06-15 19:20:00,782", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/auth/login/ HTTP/1.1\" 200 1239"}
{"time": "2026-06-15 19:20:01,001", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,016", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/dashboard/metrics/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:01,070", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,075", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,076", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,104", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/health/
{"time": "2026-06-15 19:20:01,137", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:01,158", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,159", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,199", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,188", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,212", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,223", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,236", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:01,239", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/reference-data/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:01,253", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/reference-data/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/system-settings/
{"time": "2026-06-15 19:20:01,268", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:01,275", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,285", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,285", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,300", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,327", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,332", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,395", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,454", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,459", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,470", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,484", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,532", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,575", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,594", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:01,811", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,015", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,309", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,337", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,348", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,467", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,471", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,474", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,574", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:02,715", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:02,789", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:03,060", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:03,170", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:03,325", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:03,451", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:16,386", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/system-settings/ HTTP/1.1\" 200 930"}
{"time": "2026-06-15 19:20:16,545", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/reference-data/ HTTP/1.1\" 200 983"}
{"time": "2026-06-15 19:20:16,635", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/reference-data/?include=users,departments,teams HTTP/1.1\" 200 748"}
{"time": "2026-06-15 19:20:16,734", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/dashboard/metrics/ HTTP/1.1\" 200 224"}
{"time": "2026-06-15 19:20:16,811", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/health/ HTTP/1.1\" 200 205"}
{"time": "2026-06-15 19:20:17,048", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:17,053", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:17,070", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/dashboard/staff/
{"time": "2026-06-15 19:20:17,074", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:17,091", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/dashboard/admin/
{"time": "2026-06-15 19:20:17,101", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:17,113", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:17,115", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:17,119", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,119", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/dashboard/supervisor/
{"time": "2026-06-15 19:20:17,128", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:17,130", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,145", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/dashboard/executive/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:17,158", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,187", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,215", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,215", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,233", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,243", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,259", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,266", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,270", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,309", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,354", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,938", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:17,951", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,003", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,048", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,102", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:18,175", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,183", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:18,475", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,621", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:18,818", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:18,921", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:19,252", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:28,808", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/dashboard/executive/ HTTP/1.1\" 200 393"}
{"time": "2026-06-15 19:20:28,903", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/dashboard/supervisor/ HTTP/1.1\" 200 374"}
{"time": "2026-06-15 19:20:29,058", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/dashboard/admin/ HTTP/1.1\" 200 734"}
{"time": "2026-06-15 19:20:29,131", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/dashboard/staff/ HTTP/1.1\" 200 332"}
{"time": "2026-06-15 19:20:29,304", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:29,327", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:29,352", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:29,370", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:29,374", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:29,381", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,391", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:29,395", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,402", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/active_scales/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:29,415", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,419", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,421", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,422", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:29,451", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/default/
{"time": "2026-06-15 19:20:29,467", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:29,481", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,494", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,511", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,516", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,535", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,538", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,540", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,608", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,664", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,839", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,859", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:29,882", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:30,217", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,271", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,283", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,312", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,468", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,472", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:30,476", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:30,594", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:30,597", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:37,666", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/rating-scales/active_scales/ HTTP/1.1\" 200 719"}
{"time": "2026-06-15 19:20:37,726", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/rating-scales/default/"}
{"time": "2026-06-15 19:20:37,729", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/rating-scales/default/ HTTP/1.1\" 404 41"}
{"time": "2026-06-15 19:20:37,850", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/rating-scales/?is_active=true HTTP/1.1\" 200 181"}
{"time": "2026-06-15 19:20:37,949", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/rating-scales/ HTTP/1.1\" 200 181"}
{"time": "2026-06-15 19:20:38,156", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,178", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,263", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competency-categories/
{"time": "2026-06-15 19:20:38,296", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:38,329", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:38,361", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,388", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,389", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,399", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,401", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:38,426", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,443", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,445", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,470", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,471", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,489", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/required/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:38,506", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:38,508", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/by-type/technical/
{"time": "2026-06-15 19:20:38,513", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:38,528", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,548", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,585", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,607", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,608", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,641", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,645", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,660", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,736", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,761", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,824", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,848", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:38,943", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,047", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:39,124", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,230", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,306", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,367", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,398", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,556", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,580", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,584", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:39,609", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:39,617", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:39,619", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:39,648", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:47,670", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/competencies/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:20:47,754", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/competencies/active/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:47,832", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/competencies/by-type/technical/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:47,919", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/competency-categories/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:20:47,997", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/competencies/required/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:48,177", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,201", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,214", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,294", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,298", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,309", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,361", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/
{"time": "2026-06-15 19:20:48,363", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,372", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/upcoming/
{"time": "2026-06-15 19:20:48,386", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,406", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,423", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,426", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,434", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,448", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,451", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,459", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/archived/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,472", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,480", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:48,483", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/completed/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,509", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,512", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/my_cycles/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:48,539", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,549", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,554", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,559", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,568", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,577", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,601", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,605", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,634", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,683", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,708", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,781", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,806", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,820", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,906", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,955", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,983", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:48,989", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,009", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,057", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,077", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,105", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:49,119", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:49,130", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,136", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,152", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:49,184", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,685", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:49,744", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:50,010", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:50,321", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:50,496", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:54,661", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/archived/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:54,733", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/cycles/my_cycles/"}
{"time": "2026-06-15 19:20:54,735", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/my_cycles/ HTTP/1.1\" 404 23"}
{"time": "2026-06-15 19:20:54,807", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/cycles/active/"}
{"time": "2026-06-15 19:20:54,811", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/active/ HTTP/1.1\" 404 42"}
{"time": "2026-06-15 19:20:54,890", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:20:54,955", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/upcoming/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:55,025", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/cycles/completed/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:20:55,202", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,223", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,227", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/self-assessments/my/
{"time": "2026-06-15 19:20:55,251", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,256", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,266", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/self-assessments/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/self-assessments/pending/
{"time": "2026-06-15 19:20:55,282", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:55,284", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:55,309", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,311", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,314", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,316", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,334", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,344", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/self-assessments/submitted/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:55,382", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,390", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,398", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,401", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,402", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,412", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,418", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,427", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,429", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,441", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:20:55,492", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/self-assessments/team/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:20:55,521", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,567", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,591", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,619", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,692", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,711", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,713", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,716", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,729", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,747", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,791", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,795", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,798", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:55,845", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:55,866", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:55,968", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:56,375", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:56,401", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:56,618", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:57,091", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:20:57,295", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:20:57,386", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:04,925", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/self-assessments/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:05,014", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/self-assessments/team/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:05,087", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/self-assessments/my/"}
{"time": "2026-06-15 19:21:05,089", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/self-assessments/my/ HTTP/1.1\" 404 42"}
{"time": "2026-06-15 19:21:05,167", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/self-assessments/pending/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:05,291", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/self-assessments/submitted/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:05,451", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:05,474", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/supervisor-reviews/
{"time": "2026-06-15 19:21:05,502", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:05,533", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/supervisor-reviews/my-queue/
{"time": "2026-06-15 19:21:05,547", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:05,560", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,565", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,569", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,571", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:05,576", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:05,606", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:05,609", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/supervisor-reviews/pending_approvals/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:05,631", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/supervisor-reviews/stats/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:05,641", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,648", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,650", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,650", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,652", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,674", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,678", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,732", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,747", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,769", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:05,810", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,001", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,019", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,029", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,059", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,062", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,087", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,093", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:06,102", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:06,111", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:06,170", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:06,248", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:07,028", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:11,434", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/supervisor-reviews/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:11,522", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/supervisor-reviews/pending_approvals/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:11,587", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/supervisor-reviews/stats/"}
{"time": "2026-06-15 19:21:11,590", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/supervisor-reviews/stats/ HTTP/1.1\" 400 29"}
{"time": "2026-06-15 19:21:11,673", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/supervisor-reviews/my-queue/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:11,827", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,846", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,867", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,881", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/final-ratings/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:11,930", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,938", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/final-ratings/team/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:11,941", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,963", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:11,975", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/final-ratings/my/
{"time": "2026-06-15 19:21:11,987", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:11,999", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:12,019", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,027", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/final-ratings/stats/
{"time": "2026-06-15 19:21:12,031", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:12,059", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,061", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,069", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,078", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,084", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:12,125", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,134", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,149", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/final-ratings/distribution/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:12,179", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,204", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,206", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,208", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,244", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,284", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,380", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,439", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,469", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,478", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,560", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,579", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,605", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,608", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,610", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:12,612", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,659", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:12,787", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:13,085", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:13,181", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:13,309", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:13,716", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:14,023", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:20,348", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/final-ratings/stats/"}
{"time": "2026-06-15 19:21:20,351", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/final-ratings/stats/ HTTP/1.1\" 400 29"}
{"time": "2026-06-15 19:21:20,436", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/final-ratings/my/"}
{"time": "2026-06-15 19:21:20,439", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/final-ratings/my/ HTTP/1.1\" 404 35"}
{"time": "2026-06-15 19:21:20,499", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/final-ratings/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:20,572", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/final-ratings/team/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:20,627", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/final-ratings/distribution/"}
{"time": "2026-06-15 19:21:20,628", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/final-ratings/distribution/ HTTP/1.1\" 400 29"}
{"time": "2026-06-15 19:21:20,801", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:20,803", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:20,825", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:20,829", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:20,856", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/my/
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/
{"time": "2026-06-15 19:21:20,900", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:20,955", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:20,963", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:20,967", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/managing/
{"time": "2026-06-15 19:21:20,988", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:20,990", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/active/
{"time": "2026-06-15 19:21:21,006", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,039", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,076", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,084", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,099", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,104", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/team/
{"time": "2026-06-15 19:21:21,115", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,134", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,143", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,153", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,156", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/overdue/
{"time": "2026-06-15 19:21:21,166", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,181", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,191", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,199", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,229", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/trends/
{"time": "2026-06-15 19:21:21,241", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,256", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,266", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pips/report/
{"time": "2026-06-15 19:21:21,274", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,282", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,284", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,305", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,323", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,356", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,357", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,373", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,393", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pip-actions/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,394", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,406", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:21,412", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,433", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,436", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,465", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/pip-reviews/
{"time": "2026-06-15 19:21:21,505", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:21,508", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,514", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,576", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,587", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,611", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,639", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,642", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,643", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,668", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,683", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,685", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,725", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,743", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,752", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,764", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,775", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,805", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,856", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,882", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:21,966", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,088", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,190", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:22,203", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,222", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,262", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,311", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,363", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,365", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:22,391", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,555", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,656", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,717", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,841", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:22,949", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,089", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,279", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:23,391", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:23,402", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,483", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,516", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,530", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:23,688", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:23,694", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:23,856", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:24,059", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:24,305", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:25,073", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:25,667", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:25,776", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:26,341", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:31,600", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pip-actions/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:31,686", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:31,756", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/my/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:31,825", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pip-reviews/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:31,901", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/managing/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:32,025", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/report/ HTTP/1.1\" 200 291"}
{"time": "2026-06-15 19:21:32,095", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/team/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:32,166", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/overdue/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:32,303", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/trends/ HTTP/1.1\" 200 453"}
{"time": "2026-06-15 19:21:32,363", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/pips/active/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:32,511", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,520", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-requests/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:32,538", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,540", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,571", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,582", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-requests/pending/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:32,598", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,601", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,634", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,643", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,677", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-responses/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:32,700", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,732", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,753", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-requests/overdue/
{"time": "2026-06-15 19:21:32,783", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:32,790", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,805", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,806", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,801", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,812", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,821", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,835", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,847", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,847", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,889", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:32,914", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:32,935", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-summaries/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:32,964", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,001", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/feedback-summaries/my/
{"time": "2026-06-15 19:21:33,020", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:33,096", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,113", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,114", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,176", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,200", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,325", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,369", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,388", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,401", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,421", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,464", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,495", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,497", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:33,533", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:33,535", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,548", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,556", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:33,968", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:34,046", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:34,702", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:35,070", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:35,096", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:35,216", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:35,423", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:35,436", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:35,668", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:41,030", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-requests/pending/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:41,106", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-requests/overdue/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:41,169", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-requests/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:41,240", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-summaries/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:41,308", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-responses/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:41,377", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/feedback-summaries/my/"}
{"time": "2026-06-15 19:21:41,379", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/feedback-summaries/my/ HTTP/1.1\" 404 38"}
{"time": "2026-06-15 19:21:41,542", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,552", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/calibration-sessions/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:41,568", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,569", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,589", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,608", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/calibration-sessions/my/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:41,627", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,670", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,686", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,690", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,717", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,718", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,731", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,741", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/calibration-sessions/outliers/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:41,780", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/calibration-ratings/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:41,791", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,799", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,801", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,824", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,825", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,836", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,867", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:41,895", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/calibration-sessions/calibration_recommendations/
{"time": "2026-06-15 19:21:41,899", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:41,908", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,921", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,931", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,944", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,948", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:41,964", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,007", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:42,138", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,202", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,250", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,254", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,256", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,325", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,452", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:42,559", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:42,731", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:42,795", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:43,017", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:43,206", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:43,222", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:43,473", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:47,758", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/calibration-sessions/my/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:47,825", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/calibration-sessions/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:47,902", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/calibration-sessions/calibration_recommendations/"}
{"time": "2026-06-15 19:21:47,905", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/calibration-sessions/calibration_recommendations/ HTTP/1.1\" 400 29"}
{"time": "2026-06-15 19:21:47,984", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/calibration-ratings/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:48,045", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/calibration-sessions/outliers/"}
{"time": "2026-06-15 19:21:48,047", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/calibration-sessions/outliers/ HTTP/1.1\" 400 29"}
{"time": "2026-06-15 19:21:48,169", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:48,178", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/coefficients/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:48,189", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,191", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,208", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:48,217", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/coefficients/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:48,237", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,243", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,244", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,264", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,287", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,300", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,423", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,455", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,478", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:48,483", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,575", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:48,763", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:52,322", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/coefficients/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:52,387", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/coefficients/active/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:21:52,498", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:52,504", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/comments/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:52,516", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,517", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,564", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,581", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,696", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,713", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:52,730", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:54,744", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/comments/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:21:54,896", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:54,916", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/pending/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:54,958", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:54,961", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:54,970", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:54,981", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/approved/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:54,999", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,009", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,032", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,053", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,066", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,099", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:55,105", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,141", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:55,182", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:55,194", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:55,277", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,333", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,344", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:55,352", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:21:55,371", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/stats/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:55,386", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/completed/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:21:55,392", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,412", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,422", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,425", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,439", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,455", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:55,476", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,480", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,512", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,671", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,686", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,798", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:55,828", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:55,958", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,012", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,243", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,414", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:57,418", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,710", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,755", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,882", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:21:57,884", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:21:58,085", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:03,929", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/promotions/pending/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:22:04,014", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/promotions/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:22:04,137", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/promotions/stats/ HTTP/1.1\" 200 142"}
{"time": "2026-06-15 19:22:04,231", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/promotions/approved/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:22:04,307", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/promotions/completed/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:22:04,480", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:04,485", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:04,494", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:04,503", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/templates/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:04,514", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/templates/
{"time": "2026-06-15 19:22:04,516", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:04,531", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,538", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,542", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:04,554", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/templates/default/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:04,580", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,589", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,592", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,593", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,612", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,615", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,632", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,662", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,685", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,703", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,798", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,861", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,888", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,896", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:04,901", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:04,922", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:05,013", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:05,186", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:05,311", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:08,577", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/templates/ HTTP/1.1\" 200 52"}
{"time": "2026-06-15 19:22:08,638", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/reviews/templates/default/"}
{"time": "2026-06-15 19:22:08,642", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/reviews/templates/default/ HTTP/1.1\" 404 37"}
{"time": "2026-06-15 19:22:08,709", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/templates/active/ HTTP/1.1\" 200 2"}
{"time": "2026-06-15 19:22:08,850", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:08,860", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/reports/pip-summary/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:08,876", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,880", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,883", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:08,896", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/reports/rating-distribution/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:08,915", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,923", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,942", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,953", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:08,962", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:08,967", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,970", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/reports/cycle-stats/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:08,991", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:08,994", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,006", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,074", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,093", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,197", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,246", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,290", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:09,408", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,442", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,582", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,689", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:09,893", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:10,098", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:13,900", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/reports/rating-distribution/ HTTP/1.1\" 200 37"}
{"time": "2026-06-15 19:22:14,023", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/reports/pip-summary/ HTTP/1.1\" 200 291"}
{"time": "2026-06-15 19:22:14,088", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/reviews/reports/cycle-stats/ HTTP/1.1\" 200 39"}
{"time": "2026-06-15 19:22:14,206", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:14,213", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:14,216", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,217", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,249", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,259", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,411", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,433", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:14,456", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:17,111", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/rating-scales/ HTTP/1.1\" 201 745"}
{"time": "2026-06-15 19:22:17,209", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:17,214", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/14/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:17,220", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,221", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,257", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,270", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,424", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,440", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:17,455", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.patch for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:20,066", "level": "INFO", "module": "basehttp", "message": "\"PATCH /api/v1/reviews/rating-scales/14/ HTTP/1.1\" 200 713"}
{"time": "2026-06-15 19:22:20,175", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:20,182", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/14/set_default/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:20,186", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,188", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,221", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,237", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,372", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,390", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:20,406", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:22,560", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/rating-scales/14/set_default/ HTTP/1.1\" 200 712"}
{"time": "2026-06-15 19:22:22,794", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:22,804", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/14/deactivate/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:22,812", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:22,813", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:22,867", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:22,886", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:22,891", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:22,944", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,060", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,068", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,094", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:23,676", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/rating-scales/14/deactivate/"}
{"time": "2026-06-15 19:22:23,678", "level": "WARNING", "module": "basehttp", "message": "\"POST /api/v1/reviews/rating-scales/14/deactivate/ HTTP/1.1\" 400 43"}
{"time": "2026-06-15 19:22:23,777", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:23,783", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/14/activate/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:23,787", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,789", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,829", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,848", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,988", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:23,999", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:24,012", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:25,885", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/rating-scales/14/activate/ HTTP/1.1\" 200 712"}
{"time": "2026-06-15 19:22:26,020", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:26,029", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/convert/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:26,033", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,035", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,073", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,091", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,191", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,214", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,231", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:26,792", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/rating-scales/convert/"}
{"time": "2026-06-15 19:22:26,794", "level": "WARNING", "module": "basehttp", "message": "\"POST /api/v1/reviews/rating-scales/convert/ HTTP/1.1\" 400 83"}
{"time": "2026-06-15 19:22:26,894", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:26,903", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competency-categories/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:26,905", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,907", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,944", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:26,963", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:27,152", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:27,168", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:27,183", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:30,623", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/competency-categories/ HTTP/1.1\" 201 252"}
{"time": "2026-06-15 19:22:30,726", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:30,732", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competency-categories/10/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:30,737", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,738", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,779", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,801", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,963", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,978", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:30,995", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:34,921", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/competency-categories/10/ HTTP/1.1\" 204 0"}
{"time": "2026-06-15 19:22:35,074", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:35,085", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:35,090", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,092", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,147", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,172", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,379", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,402", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:35,424", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:38,978", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/competencies/ HTTP/1.1\" 201 428"}
{"time": "2026-06-15 19:22:39,124", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:39,132", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/competencies/10/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:39,138", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,139", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,196", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,220", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,224", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,303", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,511", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,544", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:39,571", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:42,261", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/competencies/10/ HTTP/1.1\" 204 0"}
{"time": "2026-06-15 19:22:42,362", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:42,369", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:42,373", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,374", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,411", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,430", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,761", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,777", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:42,797", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:44,893", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/cycles/ HTTP/1.1\" 201 953"}
{"time": "2026-06-15 19:22:45,029", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:45,038", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/cycles/3/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:45,042", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,043", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,085", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,097", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,573", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,608", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:45,647", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:48,290", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/cycles/3/ HTTP/1.1\" 204 0"}
{"time": "2026-06-15 19:22:48,430", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:48,440", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/rating-scales/14/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:48,445", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,447", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,489", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,507", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,706", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,722", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:48,741", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:51,004", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/rating-scales/14/ HTTP/1.1\" 204 0"}
{"time": "2026-06-15 19:22:51,164", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:51,176", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/coefficients/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:51,182", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:51,184", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:51,242", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:51,271", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\rest_framework\fields.py:990: UserWarning: max_value should be an integer or Decimal instance.
  warnings.warn("max_value should be an integer or Decimal instance.")
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\rest_framework\fields.py:992: UserWarning: min_value should be an integer or Decimal instance.
  warnings.warn("min_value should be an integer or Decimal instance.")
{"time": "2026-06-15 19:22:51,459", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:51,483", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:51,503", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:53,792", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/coefficients/ HTTP/1.1\" 201 426"}
{"time": "2026-06-15 19:22:53,939", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:53,949", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/coefficients/19/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:53,953", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:53,955", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:54,002", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:54,022", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:54,589", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:54,645", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:54,694", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:22:57,338", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/coefficients/19/ HTTP/1.1\" 204 0"}
{"time": "2026-06-15 19:22:57,493", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:22:57,503", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/promotions/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:22:57,507", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,510", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,560", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,582", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,584", "level": "INFO", "module": "connection_manager", "message": "Closing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,642", "level": "INFO", "module": "connection", "message": "Unhealthy connection closed for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,777", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,788", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:22:57,816", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:23:00,546", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/reviews/promotions/"}
{"time": "2026-06-15 19:23:00,552", "level": "WARNING", "module": "basehttp", "message": "\"POST /api/v1/reviews/promotions/ HTTP/1.1\" 400 164"}
{"time": "2026-06-15 19:23:00,688", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:23:00,696", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/templates/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:23:00,703", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:00,705", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:00,755", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:00,785", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:01,048", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:01,082", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:01,114", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.post for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:23:04,168", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/reviews/templates/ HTTP/1.1\" 201 654"}
{"time": "2026-06-15 19:23:04,273", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-06-15 19:23:04,279", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
[KPI MIDDLEWARE] Processing request: /api/v1/reviews/templates/15/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-06-15 19:23:04,283", "level": "DEBUG", "module": "connection_manager", "message": "Getting connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,284", "level": "INFO", "module": "connection_manager", "message": "Creating new connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,321", "level": "INFO", "module": "connection_manager", "message": "Set search_path to public for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,339", "level": "DEBUG", "module": "connection", "message": "Connection established for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,476", "level": "DEBUG", "module": "connection_manager", "message": "Releasing connection for tenant: 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,498", "level": "DEBUG", "module": "connection", "message": "Connection released for tenant 30295944-7c86-458d-b8cb-9458bc67aa6b"}
{"time": "2026-06-15 19:23:04,514", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.delete for user laban@gmail.com (Super Admin)"}
{"time": "2026-06-15 19:23:06,703", "level": "INFO", "module": "basehttp", "message": "\"DELETE /api/v1/reviews/templates/15/ HTTP/1.1\" 204 0"}