## Users & tructure
{"time": "2026-08-15 12:57:20,159", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
   ...:
   ...: target_tenant = "275adb1f-8e12-46ee-b394-ea42d41b10c9"
   ...:
   ...: # Dynamically set schema for the target tenant
   ...: schema_obj = OrganizationSchema.objects.filter(organization_id=target_tenant).first()
   ...: schema_name = schema_obj.schema_name if schema_obj else 'public'
   ...:
   ...: with connection.cursor() as cursor:
   ...:     cursor.execute(f'SET search_path TO "{schema_name}", public')
   ...:
   ...: print("=== Users ===")
   ...: for u in User.objects.filter(tenant_id=target_tenant):
   ...:     print(f"  User: {u.email} — Role: {u.role} — Active: {u.is_active}")
   ...:
   ...: print("\n=== Divisions ===")
   ...: for div in Division.objects.filter(tenant_id=target_tenant):
   ...:     print(f"  Division: {div.name} (Code: {div.code})")
   ...:
   ...: print("\n=== Departments ===")
   ...: for dept in Department.objects.filter(tenant_id=target_tenant):
   ...:     print(f"  Department: {dept.name} (Code: {dept.code})")
   ...:
   ...: print("\n=== Sections ===")
   ...: for sec in Section.objects.filter(tenant_id=target_tenant):
   ...:     print(f"  Section: {sec.name} (Code: {sec.code})")
   ...:
   ...: print("\n=== Units ===")
   ...: for unit in Unit.objects.filter(tenant_id=target_tenant):
   ...:     print(f"  Unit: {unit.name} (Code: {unit.code})")
   ...:
=== Users ===
  User: robert.martin@globalapex.com — Role: supervisor — Active: True
  User: brian.garcia@globalapex.com — Role: supervisor — Active: True
  User: nathan.scott@globalapex.com — Role: supervisor — Active: True
  User: david.miller@globalapex.com — Role: staff — Active: True
  User: thomas.wright@globalapex.com — Role: staff — Active: True
  User: sophia.martinez@globalapex.com — Role: staff — Active: True
  User: evelyn.perez@globalapex.com — Role: staff — Active: True
  User: pydjango_1784454925@example.com — Role: client_admin — Active: False
  User: pydjango_1784457260@example.com — Role: client_admin — Active: False
  User: pydjango_1784454328@example.com — Role: client_admin — Active: False
  User: jackline@falcon.com — Role: executive — Active: True
  User: victoria.king@globalapex.com — Role: executive — Active: True
  User: james.wilson@globalapex.com — Role: staff — Active: True
  User: emily.clark@globalapex.com — Role: staff — Active: True
  User: michael.brown@globalapex.com — Role: staff — Active: True
  User: justin.roberts@globalapex.com — Role: staff — Active: True
  User: kevin.white@globalapex.com — Role: staff — Active: True
  User: amanda.harris@globalapex.com — Role: staff — Active: True
  User: jessica.lee@globalapex.com — Role: staff — Active: True
  User: william.thompson@globalapex.com — Role: staff — Active: True
  User: dylan.phillips@globalapex.com — Role: staff — Active: True
  User: careen@falcontech.com — Role: client_admin — Active: True
  User: elena.rostova@globalapex.com — Role: dashboard_champion — Active: True
  User: brain@globalpex.com — Role: staff — Active: True
  User: rachel.adams@globalapex.com — Role: supervisor — Active: True
  User: daniel.taylor@globalapex.com — Role: supervisor — Active: True
  User: lisa.ray@globalapex.com — Role: supervisor — Active: True
  User: mark.vance@globalapex.com — Role: supervisor — Active: True
  User: pydjango@gmail.com — Role: client_admin — Active: True
  User: admin@falcontech.com — Role: super_admin — Active: True
  User: megan.turner@globalapex.com — Role: staff — Active: True
  User: olivia.davis@globalapex.com — Role: staff — Active: True
  User: christopher.lopez@globalapex.com — Role: staff — Active: True
  User: lauren.green@globalapex.com — Role: staff — Active: True
  User: andrew.baker@globalapex.com — Role: staff — Active: True
  User: brandon.nelson@globalapex.com — Role: staff — Active: True
  User: hannah.carter@globalapex.com — Role: staff — Active: True
  User: sarah.jenkins@globalapex.com — Role: executive — Active: True

=== Divisions ===
  Division: Commercial & Growth Division (Code: DIV_COMM)
  Division: Executive Division (Code: DIV_EXEC)
  Division: Operations & Finance Division (Code: DIV_OPS)
  Division: Technology & Product Division (Code: DIV_TECH)

=== Departments ===
  Department: Executive Office (Code: DEP_EXEC)
  Department: Strategy & Planning (Code: DEP_STRAT)
  Department: Engineering & IT (Code: DEP_ENG)
  Department: Product Management (Code: DEP_PROD)
  Department: Sales & Revenue (Code: DEP_SALES)
  Department: Marketing (Code: DEP_MKTG)
  Department: Operations & Logistics (Code: DEP_OPS)
  Department: Customer Success (Code: DEP_CS)
  Department: Finance & Admin (Code: DEP_FIN)

=== Sections ===
  Section: DevOps & Quality Assurance (Code: SEC_DEVOPS)
  Section: Enterprise Sales (Code: SEC_ENT_SALES)
  Section: Supply Chain & Logistics (Code: SEC_LOG)
  Section: Software Engineering (Code: SEC_SOFTWARE)
  Section: Customer Support & Services (Code: SEC_SUPP)

=== Units ===
  Unit: Core Backend Team (Code: UNT_BACKEND)
  Unit: Direct Accounts Team (Code: UNT_DIRECT_SALES)
  Unit: Frontend & UI Team (Code: UNT_FRONTEND)
  Unit: Accounting & Payroll Team (Code: UNT_PAYROLL)

{"time": "2026-08-15 13:03:32,758", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [6]:

## Reporting Chain
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> python manage.py show_reporting_chain --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
{"time": "2026-08-15 12:41:45,384", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-15 12:41:46,860", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-15 12:41:47,706", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-15 12:41:47,716", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-15 12:41:47,719", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-15 12:41:47,720", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-15 12:41:47,777", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-15 12:41:47,785", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-15 12:41:48,488", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-15 12:41:49,942", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[3cd89059-aca3-4aea-a395-2aa2479d218f] succeeded in 0.1720000000004802s: {'status': 'success', 'created': 0}"}

[REPORTING CHAIN INSPECTOR] Tenant '275adb1f-8e12-46ee-b394-ea42d41b10c9' (31 employments):
• Sarah Jenkins (Chief Executive Officer | Executive Office)
  Reports Chain: [ROOT / CEO]
• Victoria King (Chief Operating Officer | Executive Office)
  Reports Chain: Chief Executive Officer (6aebd1ce...)
• Elena Rostova (Performance Director | Strategy & Planning)
  Reports Chain: Chief Executive Officer (6aebd1ce...)
• Rachel Adams (Engineering Manager | Engineering & IT)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Mark Vance (Sales Manager | Sales & Revenue)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Daniel Taylor (Operations Director | Operations & Logistics)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Lisa Ray (Marketing Manager | Marketing)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Robert Martin (Customer Support Lead | Customer Success)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Brian Garcia (Finance Manager | Finance & Admin)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Nathan Scott (Product Director | Product Management)
  Reports Chain: Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• David Miller (Principal Systems Architect | Engineering & IT)
  Reports Chain: Engineering Manager (f56ea3dc...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Thomas Wright (Senior Software Engineer | Engineering & IT)
  Reports Chain: Principal Systems Architect (92e89cce...) -> Engineering Manager (f56ea3dc...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Sophia Martinez (DevOps Lead | Engineering & IT)
  Reports Chain: Engineering Manager (f56ea3dc...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Evelyn Perez (QA Automation Lead | Engineering & IT)
  Reports Chain: DevOps Lead (c06c72e4...) -> Engineering Manager (f56ea3dc...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• James Wilson (Senior Account Executive | Sales & Revenue)
  Reports Chain: Sales Manager (29d240ca...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Emily Clark (Account Executive | Sales & Revenue)
  Reports Chain: Senior Account Executive (0975937d...) -> Sales Manager (29d240ca...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Michael Brown (Sales Development Rep | Sales & Revenue)
  Reports Chain: Account Executive (c37db92f...) -> Senior Account Executive (0975937d...) -> Sales Manager (29d240ca...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Justin Roberts (Enterprise Account Executive | Sales & Revenue)
  Reports Chain: Sales Manager (29d240ca...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Kevin White (Digital Marketing Specialist | Marketing)
  Reports Chain: Marketing Manager (47032fba...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Amanda Harris (Content Strategist | Marketing)
  Reports Chain: Digital Marketing Specialist (61e52b35...) -> Marketing Manager (47032fba...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Jessica Lee (Customer Success Manager | Customer Success)
  Reports Chain: Customer Support Lead (73fb57e0...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• William Thompson (Support Specialist | Customer Success)
  Reports Chain: Customer Success Manager (16dc738a...) -> Customer Support Lead (73fb57e0...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Megan Turner (Client Relationship Lead | Customer Success)
  Reports Chain: Customer Support Lead (73fb57e0...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Olivia Davis (Senior Accountant | Finance & Admin)
  Reports Chain: Finance Manager (7209a109...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Christopher Lopez (Financial Analyst | Finance & Admin)
  Reports Chain: Senior Accountant (2cc94fe7...) -> Finance Manager (7209a109...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Lauren Green (Senior Product Manager | Product Management)
  Reports Chain: Product Director (f461e46a...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Andrew Baker (UI/UX Designer | Product Management)
  Reports Chain: Senior Product Manager (0dbf0a0c...) -> Product Director (f461e46a...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Brandon Nelson (Logistics Coordinator | Operations & Logistics)
  Reports Chain: Operations Director (2b954190...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Hannah Carter (Procurement Specialist | Operations & Logistics)
  Reports Chain: Logistics Coordinator (26f7663d...) -> Operations Director (2b954190...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Dylan Phillips (Supply Chain Analyst | Operations & Logistics)
  Reports Chain: Logistics Coordinator (26f7663d...) -> Operations Director (2b954190...) -> Chief Operating Officer (1eba27ca...) -> Chief Executive Officer (6aebd1ce...)
• Careen Anyango (Client Administrator | Executive Office)
  Reports Chain: Chief Executive Officer (6aebd1ce...)


## KPIs && Assignments:
{"time": "2026-08-16 12:47:41,128", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
   ...: schema_obj = OrganizationSchema.objects.filter(organization_id=target_tenant).first()
   ...: schema_name = schema_obj.schema_name if schema_obj else 'public'
   ...:
   ...: with connection.cursor() as cursor:
   ...:     cursor.execute(f'SET search_path TO "{schema_name}", public')
   ...:
   ...: kpi = KPI.objects.filter(tenant_id=target_tenant, name__icontains="Master Corporate").first()
   ...:
   ...: if kpi:
   ...:     print(f"=== KPI: {kpi.name} ===")
   ...:     print(f"  Owner: {kpi.owner.email if kpi.owner else 'None'}")
   ...:
   ...:     target_users = list(AnnualTarget.objects.filter(kpi=kpi, tenant_id=target_tenant).values_list('user__email'
      ⋮ , flat=True).distinct())
   ...:     print(f"\n  Assigned Users via AnnualTarget ({len(target_users)}):")
   ...:     for email in target_users:
   ...:         print(f"    - {email}")
   ...:
   ...:     weight_users = list(KPIWeight.objects.filter(kpi=kpi, tenant_id=target_tenant).values_list('user__email', f
      ⋮ lat=True).distinct())
   ...:     print(f"\n  Assigned Users via KPIWeight ({len(weight_users)}):")
   ...:     for email in weight_users:
   ...:         print(f"    - {email}")
   ...:
   ...:     actual_users = list(MonthlyActual.objects.filter(kpi=kpi, tenant_id=target_tenant).values_list('user__email
      ⋮ ', flat=True).distinct())
   ...:     print(f"\n  Users with Monthly Actuals ({len(actual_users)}):")
   ...:     for email in actual_users:
   ...:         print(f"    - {email}")
   ...:
=== KPI: Master Corporate Annual Net Sales Revenue ===
  Owner: sarah.jenkins@globalapex.com

  Assigned Users via AnnualTarget (8):
    - daniel.taylor@globalapex.com
    - emily.clark@globalapex.com
    - james.wilson@globalapex.com
    - lisa.ray@globalapex.com
    - mark.vance@globalapex.com
    - michael.brown@globalapex.com
    - rachel.adams@globalapex.com
    - sarah.jenkins@globalapex.com

  Assigned Users via KPIWeight (0):

  Users with Monthly Actuals (1):
    - emily.clark@globalapex.com

{"time": "2026-08-16 12:52:41,708", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}

## KPI Cascading
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> python scratch/kpi/cascading.py
{"time": "2026-08-16 12:59:03,834", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-16 12:59:04,944", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-16 12:59:04,944", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-16 12:59:04,971", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-16 12:59:04,982", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-16 12:59:05,010", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-16 12:59:05,020", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-16 12:59:05,028", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-16 12:59:05,030", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 5m)"}
{"time": "2026-08-16 12:59:05,324", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-16 12:59:06,370", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-16 12:59:06,380", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-16 12:59:06,386", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-16 12:59:06,388", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-16 12:59:06,467", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-16 12:59:06,481", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-16 12:59:07,515", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-16 12:59:09,904", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[d9a4d7ac-ad31-4c24-9610-b57f53e315cc] succeeded in 0.20300000000861473s: {'status': 'success', 'created': 0}"}
=== KPI: Master Corporate Annual Net Sales Revenue ===

--- CascadeMap records count: 7 ---
  Rule: Custom Executive Strategy Breakdown | Contribution: 60.00% | Parent: sarah.jenkins@globalapex.com -> Child: mark.vance@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 25.00% | Parent: sarah.jenkins@globalapex.com -> Child: daniel.taylor@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 15.00% | Parent: sarah.jenkins@globalapex.com -> Child: rachel.adams@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 75.00% | Parent: mark.vance@globalapex.com -> Child: james.wilson@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 25.00% | Parent: mark.vance@globalapex.com -> Child: lisa.ray@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 55.55% | Parent: james.wilson@globalapex.com -> Child: emily.clark@globalapex.com
  Rule: Custom Executive Strategy Breakdown | Contribution: 44.45% | Parent: james.wilson@globalapex.com -> Child: michael.brown@globalapex.com

--- AnnualTargets (8) breakdown by Organizational Structure ---

  User: james.wilson@globalapex.com
    Position: Senior Account Executive
    Department: Sales & Revenue
    Division: Commercial & Growth Division
    Target Value: 45000000.00 (Year: 2026)

  User: emily.clark@globalapex.com
    Position: Account Executive
    Department: Sales & Revenue
    Division: Commercial & Growth Division
    Target Value: 24997500.00 (Year: 2026)

  User: michael.brown@globalapex.com
    Position: Sales Development Rep
    Department: Sales & Revenue
    Division: Commercial & Growth Division
    Target Value: 20002500.00 (Year: 2026)

  User: rachel.adams@globalapex.com
    Position: Engineering Manager
    Department: Engineering & IT
    Division: Technology & Product Division
    Target Value: 15000000.00 (Year: 2026)

  User: daniel.taylor@globalapex.com
    Position: Operations Director
    Department: Operations & Logistics
    Division: Operations & Finance Division
    Target Value: 25000000.00 (Year: 2026)

  User: lisa.ray@globalapex.com
    Position: Marketing Manager
    Department: Marketing
    Division: Commercial & Growth Division
    Target Value: 15000000.00 (Year: 2026)

  User: mark.vance@globalapex.com
    Position: Sales Manager
    Department: Sales & Revenue
    Division: Commercial & Growth Division
    Target Value: 60000000.00 (Year: 2026)

  User: sarah.jenkins@globalapex.com
    Position: Chief Executive Officer
    Department: Executive Office
    Division: Executive Division
    Target Value: 100000000.00 (Year: 2026)

==================================================
=== CASCADED STRUCTURE NODES SUMMARY ===
==================================================

[Divisions - 4]:
  - Commercial & Growth Division (DIV_COMM)
  - Executive Division (DIV_EXEC)
  - Operations & Finance Division (DIV_OPS)
  - Technology & Product Division (DIV_TECH)

[Departments - 5]:
  - Engineering & IT (DEP_ENG)
  - Executive Office (DEP_EXEC)
  - Marketing (DEP_MKTG)
  - Operations & Logistics (DEP_OPS)
  - Sales & Revenue (DEP_SALES)

[Sections - 0]:
  - None

[Units - 0]:
  - None