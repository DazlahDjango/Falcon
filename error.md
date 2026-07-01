look at my django audit earlier it created a user from frontend and it was successfull.

{"time": "2026-06-21 09:44:30,159", "level": "INFO", "module": "signals", "message": "Profile created for user: kim@gmail.com"}
{"time": "2026-06-21 09:44:30,331", "level": "INFO", "module": "signals", "message": "Preferences created for user: kim@gmail.com"}
{"time": "2026-06-21 09:44:30,580", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.created for user kim@gmail.com (Staff)"}
{"time": "2026-06-21 09:44:30,639", "level": "INFO", "module": "signals", "message": "User created: kim@gmail.com (ID: 68a033c1-e74d-47b4-be3d-aa38b8e6869a)"}
{"time": "2026-06-21 09:44:49,729", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/admin/users/ HTTP/1.1\" 201 199"}

later I came to check with the django shell and it was in the shell too.
In [1]: from apps.accounts.models import User

{"time": "2026-06-21 11:46:29,177", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [2]: users = User.objects.all()

{"time": "2026-06-21 11:46:31,684", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [3]: for user in users:
   ...:     print(f"ID: {user.id} | Name: {user.get_full_name() or user.username} | Email: {user.email} | Tenant ID: {u
      ⋮ ser.tenant_id}")
   ...:
ID: 83f08538-34aa-4121-8dfc-c0ab2a9f39aa | Name: AnonymousUser | Email: AnonymousUser | Tenant ID: 83d58535-dfcd-44d9-8f1c-4bc6874bb8fc
ID: 8b6fe530-6533-4213-90c9-a8164b0336ea | Name: labo@gmail.com | Email: labo@gmail.com | Tenant ID: 15f5128c-d156-4141-9304-0c65f57a82e7
ID: 68a033c1-e74d-47b4-be3d-aa38b8e6869a | Name: Kim Jun | Email: kim@gmail.com | Tenant ID: 15f5128c-d156-4141-9304-0c65f57a82e7
ID: 1568c6fe-7c55-4150-86f2-8ce125d6ed70 | Name: donl@gmail.com | Email: donl@gmail.com | Tenant ID: 15f5128c-d156-4141-9304-0c65f57a82e7

{"time": "2026-06-21 11:46:38,599", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [4]:


But now in my user page or user management page, it displays nothing, I don't know why.
here is my console:

[AdminUserManager] useEffect triggered, loading users...
AdminUserManager.jsx:63 🔄 Users changed: []
AdminUserManager.jsx:64 📊 Users length: 0
AdminUserManager.jsx:65 ⏳ Loading state: false
AdminUserManager.jsx:66 📈 Pagination: {page: 1, pageSize: 20, total: 0, totalPages: 1, hasNext: false, …}
AdminUserManager.jsx:71 [AdminUserManager] loadUsers called
adminSlice.js:54 [fetchAdminUsers] Calling getAdminUsers with params: {limit: 20, offset: 0, page: 1, pageSize: 20, search: undefined}
AdminUserManager.jsx:62 [AdminUserManager] useEffect triggered, loading users...
AdminUserManager.jsx:63 🔄 Users changed: []
AdminUserManager.jsx:64 📊 Users length: 0
AdminUserManager.jsx:65 ⏳ Loading state: false
AdminUserManager.jsx:66 📈 Pagination: {page: 1, pageSize: 20, total: 0, totalPages: 1, hasNext: false, …}
AdminUserManager.jsx:71 [AdminUserManager] loadUsers called
adminSlice.js:54 [fetchAdminUsers] Calling getAdminUsers with params: {limit: 20, offset: 0, page: 1, pageSize: 20, search: undefined}

[fetchAdminUsers] RAW RESPONSE: {data: {…}, status: 200, statusText: 'OK', headers: AxiosHeaders, config: {…}, …}
adminSlice.js:58 [fetchAdminUsers] RESPONSE DATA: {count: 4, next: null, previous: null, results: Array(4)}
adminSlice.js:59 [fetchAdminUsers] RESPONSE STATUS: 200
adminSlice.js:63 [fetchAdminUsers] ✅ Success! Returning data
adminSlice.js:57 [fetchAdminUsers] RAW RESPONSE: {data: {…}, status: 200, statusText: 'OK', headers: AxiosHeaders, config: {…}, …}
adminSlice.js:58 [fetchAdminUsers] RESPONSE DATA: {count: 4, next: null, previous: null, results: Array(4)}
adminSlice.js:59 [fetchAdminUsers] RESPONSE STATUS: 200
adminSlice.js:63 [fetchAdminUsers] ✅ Success! Returning data
loggerMiddleware.js:4 [Redux] billing/analytics/fetchSummary/pending
loggerMiddleware.js:5 Action: {type: 'billing/analytics/fetchSummary/pending', payload: undefined, meta: {…}}
loggerMiddleware.js:6 Prev State: {auth: {…}, users: {…}, roles: {…}, permissions: {…}, sessions: {…}, …}
loggerMiddleware.js:9 Next State: {auth: {…}, users: {…}, roles: {…}, permissions: {…}, sessions: {…}, …}
