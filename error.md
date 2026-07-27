Read the following from the shell, I'm trying to login and it passes login, I go to dashboard but now after sometimes or clicking any other tab it refreshes I don't know why,,, So I think you might be able to help me identifie the problem:


{"time": "2026-07-14 10:12:11,651", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [1]: from apps.tenant.models import Organization, OrganizationSector

{"time": "2026-07-14 10:13:44,927", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [2]: from apps.tenant.services import OrganizationService

{"time": "2026-07-14 10:14:27,640", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [3]: from django.contrib.auth import get_user_model

{"time": "2026-07-14 10:14:32,617", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [4]: User = get_user_model()

{"time": "2026-07-14 10:14:35,790", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [5]: from apps.tenant.services import DataSeederService

{"time": "2026-07-14 10:14:54,853", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [6]: seeder = DataSeederService()

{"time": "2026-07-14 10:15:05,041", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [7]: service = OrganizationService()

{"time": "2026-07-14 10:15:11,332", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [8]: seeder.seed_sectors()
{"time": "2026-07-14 10:15:24,120", "level": "INFO", "module": "seeder_service", "message": "Seeded 4 sectors"}
Out[8]:
[<OrganizationSector: Commercial - Corporate>,
 <OrganizationSector: Non-Profit - Non-Profit>,
 <OrganizationSector: Public Sector - Government>,
 <OrganizationSector: Consulting - Consulting>]

{"time": "2026-07-14 10:15:24,127", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [9]: org = service.create_organization({
   ...:  'name': 'Falcon Technologies',
   ...:  'contact_email': 'admin@falcontech.com',
   ...:  'contact_phone': '+254712345678',
   ...:  'contact_address': '123 Nairobi, Kenya',
   ...:  'website': 'https://falcontech.com',
   ...:  'primary_color': '#2563EB',
   ...:  'secondary_color': '#7C3AED',
   ...:  'subscription_tier': 'enterprise',
   ...:  'sector_id': OrganizationSector.objects.first().id if OrganizationSector.objects.exists() else None
   ...: })
{"time": "2026-07-14 10:15:58,597", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=True)"}
{"time": "2026-07-14 10:15:58,605", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:58,606", "level": "INFO", "module": "organization_service", "message": "Created organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 \u2014 Falcon Technologies"}
{"time": "2026-07-14 10:15:58,812", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step STARTING (0%): Starting organization provisioning pipeline..."}
{"time": "2026-07-14 10:15:58,819", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:58,827", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:15:58,876", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:58,878", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:15:58,897", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step CREATING_SCHEMA (20%): Creating database schema 'org_falcon_technologies'..."}
{"time": "2026-07-14 10:15:58,901", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:58,903", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:15:58,946", "level": "INFO", "module": "core_signals", "message": "Schema org_falcon_technologies created for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:15:58,952", "level": "INFO", "module": "schema_service", "message": "Created schema record: org_falcon_technologies for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:15:58,983", "level": "INFO", "module": "schema_service", "message": "Provisioned schema: org_falcon_technologies"}
{"time": "2026-07-14 10:15:58,987", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (40%): Syncing and running database migrations..."}
{"time": "2026-07-14 10:15:58,993", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:58,994", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:15:59,457", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 6102e576-12b5-4347-9bb8-4ddae94b8a94. Created: 7, Updated: 0"}
{"time": "2026-07-14 10:15:59,462", "level": "INFO", "module": "provisioning_service", "message": "Found 7 pending migrations for organization 'Falcon Technologies'"}
{"time": "2026-07-14 10:15:59,467", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (43%): Applying migration 1/7: accounts.0001_initial"}
{"time": "2026-07-14 10:15:59,471", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:15:59,473", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0001_initial, from accounts
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying accounts.0001_initial... OK
{"time": "2026-07-14 10:16:03,276", "level": "WARNING", "module": "router_service", "message": "Failed to get org DB: Organization matching query does not exist."}
{"time": "2026-07-14 10:16:03,284", "level": "INFO", "module": "signals", "message": "Profile created for user: AnonymousUser"}
{"time": "2026-07-14 10:16:03,295", "level": "WARNING", "module": "router_service", "message": "Failed to get org DB: Organization matching query does not exist."}
{"time": "2026-07-14 10:16:03,300", "level": "INFO", "module": "signals", "message": "Preferences created for user: AnonymousUser"}
{"time": "2026-07-14 10:16:03,307", "level": "WARNING", "module": "router_service", "message": "Failed to get org DB: Organization matching query does not exist."}
{"time": "2026-07-14 10:16:03,345", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.created for user AnonymousUser (Staff)"}
{"time": "2026-07-14 10:16:03,346", "level": "INFO", "module": "signals", "message": "User created: AnonymousUser (ID: 987e966d-3cbe-4a91-b1c2-3d61ef504c95)"}
{"time": "2026-07-14 10:16:03,426", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:03,495", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:03,545", "level": "INFO", "module": "migration_service", "message": "Applied migration accounts.0001_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:03,546", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (47%): Applying migration 2/7: structure.0001_initial"}
{"time": "2026-07-14 10:16:03,554", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:03,556", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0001_initial, from structure
Running migrations:
  Applying structure.0001_initial... OK
{"time": "2026-07-14 10:16:06,907", "level": "INFO", "module": "migration_service", "message": "Applied migration structure.0001_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:06,908", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (50%): Applying migration 3/7: kpi.0001_initial"}
{"time": "2026-07-14 10:16:06,925", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:06,928", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0001_initial, from kpi
Running migrations:
  Applying kpi.0001_initial... OK
{"time": "2026-07-14 10:16:08,655", "level": "INFO", "module": "migration_service", "message": "Applied migration kpi.0001_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:08,656", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (54%): Applying migration 4/7: kpi.0002_initial"}
{"time": "2026-07-14 10:16:08,670", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:08,672", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0002_initial, from kpi
Running migrations:
  Applying tenant.0001_initial... OK
  Applying kpi.0002_initial... OK
{"time": "2026-07-14 10:16:27,247", "level": "INFO", "module": "migration_service", "message": "Applied migration kpi.0002_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:27,248", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (57%): Applying migration 5/7: reviews.0001_initial"}
{"time": "2026-07-14 10:16:27,255", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:27,257", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0001_initial, from reviews
Running migrations:
  Applying reviews.0001_initial... OK
{"time": "2026-07-14 10:16:28,722", "level": "INFO", "module": "migration_service", "message": "Applied migration reviews.0001_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:28,723", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (61%): Applying migration 6/7: reviews.0002_initial"}
{"time": "2026-07-14 10:16:28,751", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:28,753", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0002_initial, from reviews
Running migrations:
  Applying reviews.0002_initial... OK
{"time": "2026-07-14 10:16:54,648", "level": "INFO", "module": "migration_service", "message": "Applied migration reviews.0002_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:54,649", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step MIGRATING (65%): Applying migration 7/7: dashboard.0001_initial"}
{"time": "2026-07-14 10:16:54,653", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:54,655", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
Operations to perform:
  Target specific migration: 0001_initial, from dashboard
Running migrations:
  Applying dashboard.0001_initial... OK
{"time": "2026-07-14 10:16:56,493", "level": "INFO", "module": "migration_service", "message": "Applied migration dashboard.0001_initial for org 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 10:16:56,496", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step PROVISIONING_RESOURCES (75%): Setting up resource quotas and limits..."}
{"time": "2026-07-14 10:16:56,500", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:56,502", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:56,534", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,547", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,552", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,557", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,562", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,569", "level": "DEBUG", "module": "router_service", "message": "Error getting object org: OrganizationResource matching query does not exist."}
{"time": "2026-07-14 10:16:56,573", "level": "INFO", "module": "provisioning_service", "message": "Created default resources for Falcon Technologies"}
{"time": "2026-07-14 10:16:56,574", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step SEEDING (85%): Seeding default system roles and configurations..."}
{"time": "2026-07-14 10:16:56,577", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:56,579", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:56,594", "level": "INFO", "module": "seeder_service", "message": "Seeding default data for Falcon Technologies"}
{"time": "2026-07-14 10:16:56,641", "level": "INFO", "module": "seeder_service", "message": "Seeding completed for tenant: Falcon Technologies"}
{"time": "2026-07-14 10:16:56,642", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step CREATING_ADMIN (92%): Creating organization client administrator..."}
{"time": "2026-07-14 10:16:56,648", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:56,650", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:57,853", "level": "INFO", "module": "signals", "message": "Profile created for user: admin@falcontech.com"}
{"time": "2026-07-14 10:16:57,862", "level": "INFO", "module": "signals", "message": "Preferences created for user: admin@falcontech.com"}
{"time": "2026-07-14 10:16:57,863", "level": "INFO", "module": "signals", "message": "User created: admin@falcontech.com (ID: 3fb9d00b-bd8f-4e14-a437-a2de05bef78d)"}
{"time": "2026-07-14 10:16:57,906", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:57,923", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:57,952", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:57,968", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:58,398", "level": "ERROR", "module": "provisioning_service", "message": "Failed to send welcome email to admin@falcontech.com: email/base.html"}
{"time": "2026-07-14 10:16:58,404", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:58,407", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:58,424", "level": "INFO", "module": "provisioning_service", "message": "[Falcon Technologies] Step COMPLETED (100%): Organization provisioning completed successfully."}
{"time": "2026-07-14 10:16:58,428", "level": "INFO", "module": "core_signals", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 saved (created=False)"}
{"time": "2026-07-14 10:16:58,430", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:16:58,443", "level": "INFO", "module": "provisioning_service", "message": "Provisioned organization successfully: 6102e576-12b5-4347-9bb8-4ddae94b8a94 - Falcon Technologies"}
{"time": "2026-07-14 10:16:58,459", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.created for user admin@falcontech.com (Client Admin)"}
{"time": "2026-07-14 10:16:58,460", "level": "INFO", "module": "tasks", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 provisioned successfully"}
{"time": "2026-07-14 10:16:58,500", "level": "INFO", "module": "trace", "message": "Task organization.provision_organization[828bfb23-e6be-4695-8ce7-d3adcc82c890] succeeded in 59.6880000000092s: True"}

{"time": "2026-07-14 10:16:58,506", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [10]: admin_user = User.objects.create_user(
    ...:      email='admin@falcon.com',
    ...:      username='falconigc_admin',
    ...:      password='Dazl@123',
    ...:      first_name='Falconigc',
    ...:      last_name='Admin1',
    ...:      role='super_admin',  # or 'client_admin' for org admin
    ...:      is_superuser=True,
    ...:      is_staff=True,
    ...:      is_active=True,
    ...:      is_verified=True,
    ...:      is_onboarded=True,
    ...:      tenant_id=org.id
    ...:  )
{"time": "2026-07-14 10:19:09,964", "level": "INFO", "module": "signals", "message": "Profile created for user: admin@falcon.com"}
{"time": "2026-07-14 10:19:09,971", "level": "INFO", "module": "signals", "message": "Preferences created for user: admin@falcon.com"}
{"time": "2026-07-14 10:19:09,975", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.created for user admin@falcon.com (Super Admin)"}
{"time": "2026-07-14 10:19:09,976", "level": "INFO", "module": "signals", "message": "User created: admin@falcon.com (ID: 7ef5ed16-49d1-4ea4-9636-6befdbcfa20b)"}
{"time": "2026-07-14 10:19:09,992", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:19:10,012", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}

{"time": "2026-07-14 10:19:10,030", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [11]: user.save()
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)
Cell In[11], line 1
----> 1 user.save()

NameError: name 'user' is not defined

{"time": "2026-07-14 10:19:22,287", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [12]: admin_user.save()
{"time": "2026-07-14 10:19:32,720", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 10:19:32,736", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}

{"time": "2026-07-14 10:19:32,756", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
In [13]: {"time": "2026-07-14 10:54:10,652", "level": "INFO", "module": "connection_cleanup", "message": "Closed 1 idle connections"}
{"time": "2026-07-14 10:55:10,706", "level": "INFO", "module": "connection_cleanup", "message": "Closed 3 idle connections"}
{"time": "2026-07-14 11:31:11,178", "level": "INFO", "module": "connection_cleanup", "message": "Closed 6 idle connections"}
In [13]: exit()



Look at the django-logs:
{"time": "2026-07-14 15:42:15,182", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/summary/"}
{"time": "2026-07-14 15:42:15,184", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/summary/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:15,191", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,201", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/summary/"}
{"time": "2026-07-14 15:42:15,202", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,207", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,394", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:15,396", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,632", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,647", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/summary/"}
{"time": "2026-07-14 15:42:15,649", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:15,651", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,652", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/summary/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:15,874", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:15,877", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/revenue/?period%5Bdays%5D=30&period%5Bperiod%5D=daily HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:15,888", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:15,901", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:15,903", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,141", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:16,143", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/subscriptions/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:16,150", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,162", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:16,164", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,523", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:16,525", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/revenue/?period%5Bdays%5D=30&period%5Bperiod%5D=daily HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:16,575", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:16,577", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/subscriptions/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:16,586", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,594", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:16,597", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,827", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/subscriptions/"}
{"time": "2026-07-14 15:42:16,829", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/subscriptions/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:16,971", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:16,981", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:16,982", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:17,203", "level": "WARNING", "module": "log", "message": "Bad Request: /api/v1/billing/analytics/revenue/"}
{"time": "2026-07-14 15:42:17,204", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/billing/analytics/revenue/?period%5Bdays%5D=30&period%5Bperiod%5D=daily HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:42:46,188", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
[KPI MIDDLEWARE] Processing request: /api/v1/auth/login/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:42:46,360", "level": "DEBUG", "module": "helpers", "message": "Using request.META.get('REMOTE_ADDR', None) fallback method to get client IP address"}
{"time": "2026-07-14 15:42:46,362", "level": "DEBUG", "module": "helpers", "message": "Using parameter credentials to get username with key settings.AXES_USERNAME_FORM_FIELD"}
{"time": "2026-07-14 15:42:46,365", "level": "DEBUG", "module": "database", "message": "AXES: Getting access attempts that are newer than 2026-07-14 12:27:46.360621+00:00"}
{"time": "2026-07-14 15:42:47,601", "level": "INFO", "module": "authentication", "message": "Completing authentication for user: admin@falcon.com"}
{"time": "2026-07-14 15:42:48,090", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 15:42:48,201", "level": "DEBUG", "module": "proactor_events", "message": "Using proactor: IocpProactor"}
{"time": "2026-07-14 15:42:48,223", "level": "DEBUG", "module": "authentication", "message": "User login info updated"}
{"time": "2026-07-14 15:42:48,333", "level": "INFO", "module": "signals", "message": "Session created for user: admin@falcon.com from 127.0.0.1"}
{"time": "2026-07-14 15:42:48,375", "level": "INFO", "module": "signals", "message": "Session revoked for user: admin@falcon.com"}
{"time": "2026-07-14 15:42:48,397", "level": "DEBUG", "module": "logger", "message": "Audit log created: session.revoked for user admin@falcon.com (Super Admin)"}
{"time": "2026-07-14 15:42:48,398", "level": "DEBUG", "module": "authentication", "message": "Session created: 2e31fc52-862d-40f5-a90c-cb4eed0a333b"}
{"time": "2026-07-14 15:42:48,452", "level": "DEBUG", "module": "authentication", "message": "JWT tokens generated"}
{"time": "2026-07-14 15:42:48,461", "level": "DEBUG", "module": "authentication", "message": "Login attempt recorded"}
{"time": "2026-07-14 15:42:48,467", "level": "DEBUG", "module": "logger", "message": "Audit log created: user.login for user admin@falcon.com (Super Admin)"}
{"time": "2026-07-14 15:42:48,468", "level": "DEBUG", "module": "authentication", "message": "Audit log created"}
{"time": "2026-07-14 15:42:48,477", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:51,970", "level": "INFO", "module": "basehttp", "message": "\"POST /api/v1/auth/login/ HTTP/1.1\" 200 1291"}
{"time": "2026-07-14 15:42:52,542", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:42:52,545", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:42:52,554", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:52,556", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:52,553", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:52,557", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:52,568", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:42:53,004", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:53,345", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:53,368", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,333", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,356", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,376", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,377", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,379", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,541", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,548", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,559", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,560", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,624", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:42:53,668", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:53,743", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:53,744", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:53,760", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:53,800", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:53,804", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,822", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,831", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,834", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:53,897", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/permissions/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:42:53,903", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:42:53,913", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:53,999", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:54,396", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/tenant/organizations/6102e576-12b5-4347-9bb8-4ddae94b8a94/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:42:54,585", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:54,614", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:54,673", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:54,701", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:54,774", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/sessions/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:42:54,853", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:54,917", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:54,929", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:55,598", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:42:55,716", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:55,734", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:55,753", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:55,812", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:56,006", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:56,085", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:56,128", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:56,192", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/security/"}
{"time": "2026-07-14 15:42:56,223", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/roles/assignable/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:42:56,489", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:56,597", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:57,026", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:57,092", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:57,106", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:57,772", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:58,070", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:42:58,214", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:42:58,704", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:42:59,051", "level": "WARNING", "module": "connection_service", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 has 20 active/idle connections; max is 20"}
{"time": "2026-07-14 15:42:59,099", "level": "ERROR", "module": "connection_management", "message": "Failed to establish connection for org 6102e576-12b5-4347-9bb8-4ddae94b8a94: Maximum allowed connections reached for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/notifications/unread-count/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:01,106", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:01,214", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:01,709", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:01,728", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:02,718", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:02,876", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:03,018", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:03,051", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:03,179", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:03,777", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:04,019", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:04,159", "level": "WARNING", "module": "connection_service", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 has 20 active/idle connections; max is 20"}
{"time": "2026-07-14 15:43:04,253", "level": "ERROR", "module": "connection_management", "message": "Failed to establish connection for org 6102e576-12b5-4347-9bb8-4ddae94b8a94: Maximum allowed connections reached for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/tenant/domains/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:06,519", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:06,677", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user admin@falcon.com (Super Admin)"}
{"time": "2026-07-14 15:43:07,754", "level": "WARNING", "module": "log", "message": "Bad Request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:08,067", "level": "INFO", "module": "basehttp", "message": "- Broken pipe from ('127.0.0.1', 64604)"}
{"time": "2026-07-14 15:43:10,827", "level": "WARNING", "module": "log", "message": "Bad Request: /ws/security/"}
{"time": "2026-07-14 15:43:10,870", "level": "INFO", "module": "basehttp", "message": "- Broken pipe from ('127.0.0.1', 64611)"}
{"time": "2026-07-14 15:43:12,064", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/tenant/domains/?search=&page=1&pageSize=20 HTTP/1.1\" 200 52"}
{"time": "2026-07-14 15:43:12,171", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/notifications/unread-count/"}
{"time": "2026-07-14 15:43:12,181", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/notifications/unread-count/ HTTP/1.1\" 404 232682"}
{"time": "2026-07-14 15:43:12,210", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:12,248", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,253", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,305", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,317", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,332", "level": "WARNING", "module": "log", "message": "Unauthorized: /api/v1/permissions/"}
{"time": "2026-07-14 15:43:12,333", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,379", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/permissions/ HTTP/1.1\" 401 51"}
{"time": "2026-07-14 15:43:12,410", "level": "WARNING", "module": "log", "message": "Bad Request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:12,442", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:12,450", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:12,452", "level": "WARNING", "module": "basehttp", "message": "\"GET /ws/dashboard/super_admin/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:43:12,457", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,480", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,497", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:12,498", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,511", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:12,519", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,527", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,537", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,538", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,553", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,555", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,577", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,605", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/notifications/unread-count/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:12,614", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:12,618", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,724", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:12,744", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:12,764", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/security/"}
[KPI MIDDLEWARE] Processing request: /api/v1/sessions/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:12,968", "level": "WARNING", "module": "connection_service", "message": "Organization 6102e576-12b5-4347-9bb8-4ddae94b8a94 has 20 active/idle connections; max is 20"}
{"time": "2026-07-14 15:43:12,974", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,977", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:12,982", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:12,995", "level": "ERROR", "module": "connection_management", "message": "Failed to establish connection for org 6102e576-12b5-4347-9bb8-4ddae94b8a94: Maximum allowed connections reached for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:13,061", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
[KPI MIDDLEWARE] Processing request: /api/v1/auth/refresh/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:13,154", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/sessions/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:13,423", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:13,445", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:13,449", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:13,787", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:14,088", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:15,335", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:15,572", "level": "DEBUG", "module": "logger", "message": "Audit log created: request.get for user admin@falcon.com (Super Admin)"}
{"time": "2026-07-14 15:43:25,088", "level": "WARNING", "module": "log", "message": "Bad Request: /ws/security/"}
{"time": "2026-07-14 15:43:25,097", "level": "WARNING", "module": "basehttp", "message": "\"GET /ws/security/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg0MDM0NzY4LCJpYXQiOjE3ODQwMzI5NjgsImp0aSI6IjMxZWE1ZWIzMDY0YjRhZjZhODhhYTA1ZmE4YmVlOGRlIiwidXNlcl9pZCI6IjdlZjVlZDE2LTQ5ZDEtNGVhNC05NjM2LTZiZWZkYmNmYTIwYiIsImVtYWlsIjoiYWRtaW5AZmFsY29uLmNvbSIsInJvbGUiOiJzdXBlcl9hZG1pbiIsInRlbmFudF9pZCI6IjYxMDJlNTc2LTEyYjUtNDM0Ny05YmI4LTRkZGFlOTRiOGE5NCIsImlzcyI6IkZhbGNvblBNUyJ9.e-BP_czrdLMwjX6g8djusvCdPkdaJbyNFDfWMInw8jI HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:43:25,104", "level": "INFO", "module": "basehttp", "message": "- Broken pipe from ('127.0.0.1', 64635)"}
{"time": "2026-07-14 15:43:25,126", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:25,228", "level": "INFO", "module": "basehttp", "message": "\"GET /api/v1/sessions/active/ HTTP/1.1\" 200 3289"}
{"time": "2026-07-14 15:43:25,254", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:25,260", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:25,261", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:25,263", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:25,264", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:25,265", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:25,751", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:25,887", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:25,914", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:25,936", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:25,974", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/tenant/organizations/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:26,031", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:26,052", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:26,063", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:26,139", "level": "WARNING", "module": "log", "message": "Bad Request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:26,258", "level": "WARNING", "module": "basehttp", "message": "\"GET /ws/dashboard/super_admin/ HTTP/1.1\" 400 67"}
{"time": "2026-07-14 15:43:26,264", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:26,636", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/config/maintenance/system/"}
{"time": "2026-07-14 15:43:26,638", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:26,867", "level": "WARNING", "module": "log", "message": "Not Found: /api/v1/notifications/unread-count/"}
{"time": "2026-07-14 15:43:26,871", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/notifications/unread-count/ HTTP/1.1\" 404 232682"}
{"time": "2026-07-14 15:43:26,895", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:26,897", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:26,899", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:26,900", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:26,904", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:26,910", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:26,935", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:26,962", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/sessions/active/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:27,010", "level": "WARNING", "module": "log", "message": "Unauthorized: /api/v1/auth/refresh/"}
{"time": "2026-07-14 15:43:27,013", "level": "WARNING", "module": "basehttp", "message": "\"POST /api/v1/auth/refresh/ HTTP/1.1\" 401 33"}
{"time": "2026-07-14 15:43:27,036", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:27,169", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:27,180", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:27,189", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:27,631", "level": "WARNING", "module": "organization_resolution", "message": "No organization identified for request: /ws/dashboard/super_admin/"}
{"time": "2026-07-14 15:43:27,727", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:27,893", "level": "WARNING", "module": "log", "message": "Unauthorized: /api/v1/sessions/active/"}
{"time": "2026-07-14 15:43:28,230", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/sessions/active/ HTTP/1.1\" 401 51"}
{"time": "2026-07-14 15:43:28,661", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:28,663", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:28,665", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,667", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,671", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,672", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,724", "level": "WARNING", "module": "log", "message": "Unauthorized: /api/v1/sessions/active/"}
{"time": "2026-07-14 15:43:28,728", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:28,734", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/sessions/active/ HTTP/1.1\" 401 51"}
{"time": "2026-07-14 15:43:28,782", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:28,791", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:28,794", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,800", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,801", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/notifications/unread-count/
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:28,810", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,814", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:28,975", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:29,037", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:29,064", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:29,069", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/notifications/unread-count/
{"time": "2026-07-14 15:43:29,073", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
[KPI MIDDLEWARE] current_tenant_id before: NOT SET
{"time": "2026-07-14 15:43:29,669", "level": "DEBUG", "module": "connection_service", "message": "Releasing connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:30,240", "level": "DEBUG", "module": "connection_management", "message": "Connection released for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:30,337", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:30,418", "level": "WARNING", "module": "log", "message": "Unauthorized: /api/v1/sessions/active/"}
{"time": "2026-07-14 15:43:30,701", "level": "WARNING", "module": "basehttp", "message": "\"GET /api/v1/sessions/active/ HTTP/1.1\" 401 51"}
{"time": "2026-07-14 15:43:31,535", "level": "ERROR", "module": "jwt", "message": "Token missing expected key: 0"}
{"time": "2026-07-14 15:43:31,903", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant context cleared"}
{"time": "2026-07-14 15:43:31,982", "level": "DEBUG", "module": "organization_context", "message": "Set tenant_id from header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:32,001", "level": "DEBUG", "module": "context", "message": "[TenantContext] Tenant set: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:32,193", "level": "DEBUG", "module": "organization_resolution", "message": "Organization identified via header: 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:32,207", "level": "DEBUG", "module": "organization_isolation", "message": "Anonymous access for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
{"time": "2026-07-14 15:43:32,413", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 6102e576-12b5-4347-9bb8-4ddae94b8a94 (read_only: False)"}
{"time": "2026-07-14 15:43:32,988", "level": "DEBUG", "module": "connection_management", "message": "Connection established for organization 6102e576-12b5-4347-9bb8-4ddae94b8a94"}
[KPI MIDDLEWARE] Processing request: /api/v1/sessions/active/