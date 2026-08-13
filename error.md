Postgres Shell

fasc_db=# SELECT app, name, applied FROM django_migrations ORDER BY applied DESC;
          app          |                                   name                                    |            applied
-----------------------+---------------------------------------------------------------------------+-------------------------------
 structure             | 0003_costcenterallocation_locationallocation_and_more                     | 2026-07-16 10:20:20.711662+03
 kpi                   | 0003_create_materialized_views                                            | 2026-07-16 10:19:20.304242+03
 accounts              | 0004_alter_user_tenant_id                                                 | 2026-07-16 10:19:19.977175+03
 kpi                   | 0002_alter_kpiframework_unique_together_and_more                          | 2026-07-12 21:48:59.989611+03
 accounts              | 0003_tenantpreference_default_password_custom_value_and_more              | 2026-07-09 10:32:37.442625+03
 accounts              | 0002_user_password_history                                                | 2026-07-09 10:32:36.147789+03
 structure             | 0002_division_interimassignment_organizationalunit_and_more               | 2026-07-07 12:43:18.227614+03
 tenant                | 0004_alter_organization_status_and_more                                   | 2026-07-06 23:07:25.323628+03
 tenant                | 0003_alter_organization_status                                            | 2026-07-06 11:25:31.051258+03
 tenant                | 0002_resourceusagesnapshot_and_more                                       | 2026-07-05 23:36:16.982727+03
 db                    | 0001_initial                                                              | 2026-07-02 21:58:38.11525+03
 token_blacklist       | 0013_alter_blacklistedtoken_options_and_more                              | 2026-07-02 21:58:38.10338+03
 token_blacklist       | 0012_alter_outstandingtoken_user                                          | 2026-07-02 21:58:37.896635+03
 token_blacklist       | 0011_linearizes_history                                                   | 2026-07-02 21:58:37.423851+03
 token_blacklist       | 0010_fix_migrate_to_bigautofield                                          | 2026-07-02 21:58:37.413849+03
 token_blacklist       | 0008_migrate_to_bigautofield                                              | 2026-07-02 21:58:37.019662+03
 token_blacklist       | 0007_auto_20171017_2214                                                   | 2026-07-02 21:58:36.566317+03
 token_blacklist       | 0006_auto_20171017_2113                                                   | 2026-07-02 21:58:35.671557+03
 token_blacklist       | 0005_remove_outstandingtoken_jti                                          | 2026-07-02 21:58:35.200364+03
 token_blacklist       | 0004_auto_20171017_2013                                                   | 2026-07-02 21:58:34.978756+03
 token_blacklist       | 0003_auto_20171017_2007                                                   | 2026-07-02 21:58:34.7136+03
 token_blacklist       | 0002_outstandingtoken_jti_hex                                             | 2026-07-02 21:58:34.287754+03
 token_blacklist       | 0001_initial                                                              | 2026-07-02 21:58:33.921674+03
 sites                 | 0002_alter_domain_unique                                                  | 2026-07-02 21:58:32.923001+03
 sites                 | 0001_initial                                                              | 2026-07-02 21:58:32.898381+03
 sessions              | 0001_initial                                                              | 2026-07-02 21:58:32.86985+03
 reviews               | 0001_initial                                                              | 2026-07-02 21:58:32.824794+03
 otp_totp              | 0003_add_timestamps                                                       | 2026-07-02 21:58:08.084587+03
 otp_totp              | 0002_auto_20190420_0723                                                   | 2026-07-02 21:58:07.805045+03
 otp_totp              | 0001_initial                                                              | 2026-07-02 21:58:07.516496+03
 otp_static            | 0003_add_timestamps                                                       | 2026-07-02 21:58:07.288674+03
 otp_static            | 0002_throttling                                                           | 2026-07-02 21:58:06.671634+03
 otp_static            | 0001_initial                                                              | 2026-07-02 21:58:06.378835+03
 kpi                   | 0001_initial                                                              | 2026-07-02 21:58:05.872842+03
 structure             | 0001_initial                                                              | 2026-07-02 21:57:49.376862+03
 guardian              | 0003_remove_groupobjectpermission_guardian_gr_content_ae6aec_idx_and_more | 2026-07-02 21:57:48.153559+03
 guardian              | 0002_generic_permissions_index                                            | 2026-07-02 21:57:47.844556+03
 guardian              | 0001_initial                                                              | 2026-07-02 21:57:47.542495+03
 django_celery_results | 0014_alter_taskresult_status                                              | 2026-07-02 21:57:47.147752+03
 django_celery_results | 0013_taskresult_django_cele_periodi_1993cf_idx                            | 2026-07-02 21:57:47.132754+03
 django_celery_results | 0012_taskresult_date_started                                              | 2026-07-02 21:57:47.113228+03
 django_celery_results | 0011_taskresult_periodic_task_name                                        | 2026-07-02 21:57:47.098704+03
 django_celery_results | 0010_remove_duplicate_indices                                             | 2026-07-02 21:57:47.081734+03
 django_celery_results | 0009_groupresult                                                          | 2026-07-02 21:57:47.047704+03
 django_celery_results | 0008_chordcounter                                                         | 2026-07-02 21:57:46.854877+03
 django_celery_results | 0007_remove_taskresult_hidden                                             | 2026-07-02 21:57:46.829874+03
 django_celery_results | 0006_taskresult_date_created                                              | 2026-07-02 21:57:46.816883+03
 django_celery_results | 0005_taskresult_worker                                                    | 2026-07-02 21:57:46.605765+03
 django_celery_results | 0004_auto_20190516_0412                                                   | 2026-07-02 21:57:46.591747+03
 django_celery_results | 0003_auto_20181106_1101                                                   | 2026-07-02 21:57:46.49649+03
 django_celery_results | 0002_add_task_name_args_kwargs                                            | 2026-07-02 21:57:46.487488+03
 django_celery_results | 0001_initial                                                              | 2026-07-02 21:57:46.460915+03
 django_celery_beat    | 0019_alter_periodictasks_options                                          | 2026-07-02 21:57:46.431915+03
 django_celery_beat    | 0018_improve_crontab_helptext                                             | 2026-07-02 21:57:46.423423+03
 django_celery_beat    | 0017_alter_crontabschedule_month_of_year                                  | 2026-07-02 21:57:46.404872+03
 django_celery_beat    | 0016_alter_crontabschedule_timezone                                       | 2026-07-02 21:57:46.387061+03
 django_celery_beat    | 0015_edit_solarschedule_events_choices                                    | 2026-07-02 21:57:46.363015+03
 django_celery_beat    | 0014_remove_clockedschedule_enabled                                       | 2026-07-02 21:57:46.342399+03
 django_celery_beat    | 0013_auto_20200609_0727                                                   | 2026-07-02 21:57:46.310405+03
 django_celery_beat    | 0012_periodictask_expire_seconds                                          | 2026-07-02 21:57:46.28778+03
 django_celery_beat    | 0011_auto_20190508_0153                                                   | 2026-07-02 21:57:46.263248+03
 django_celery_beat    | 0010_auto_20190429_0326                                                   | 2026-07-02 21:57:46.222889+03
 django_celery_beat    | 0009_periodictask_headers                                                 | 2026-07-02 21:57:45.766723+03
 django_celery_beat    | 0006_periodictask_priority                                                | 2026-07-02 21:57:45.743914+03
 django_celery_beat    | 0006_auto_20180210_1226                                                   | 2026-07-02 21:57:45.724635+03
 django_celery_beat    | 0008_auto_20180914_1922                                                   | 2026-07-02 21:57:45.66201+03
 django_celery_beat    | 0007_auto_20180521_0826                                                   | 2026-07-02 21:57:45.558671+03
 django_celery_beat    | 0006_auto_20180322_0932                                                   | 2026-07-02 21:57:45.50845+03
 django_celery_beat    | 0005_add_solarschedule_events_choices                                     | 2026-07-02 21:57:45.408461+03
 django_celery_beat    | 0004_auto_20170221_0000                                                   | 2026-07-02 21:57:45.393928+03
 django_celery_beat    | 0003_auto_20161209_0049                                                   | 2026-07-02 21:57:45.377934+03
 django_celery_beat    | 0002_auto_20161118_0346                                                   | 2026-07-02 21:57:45.352759+03
 django_celery_beat    | 0001_initial                                                              | 2026-07-02 21:57:45.318707+03
 django_apscheduler    | 0009_djangojobexecution_unique_job_executions                             | 2026-07-02 21:57:45.24264+03
 django_apscheduler    | 0008_remove_djangojobexecution_started                                    | 2026-07-02 21:57:45.227554+03
 django_apscheduler    | 0007_auto_20200717_1404                                                   | 2026-07-02 21:57:45.204373+03
 django_apscheduler    | 0006_remove_djangojob_name                                                | 2026-07-02 21:57:45.168735+03
 django_apscheduler    | 0005_migrate_name_to_id                                                   | 2026-07-02 21:57:45.148593+03
 django_apscheduler    | 0004_auto_20200717_1043                                                   | 2026-07-02 21:57:44.975249+03
 django_apscheduler    | 0003_auto_20200716_1632                                                   | 2026-07-02 21:57:44.912107+03
 django_apscheduler    | 0002_auto_20180412_0758                                                   | 2026-07-02 21:57:44.838774+03
 django_apscheduler    | 0001_initial                                                              | 2026-07-02 21:57:44.826774+03
 db                    | 0002_alter_testmodel_id                                                   | 2026-07-02 21:57:44.762773+03
 health_check_db       | 0001_initial                                                              | 2026-07-02 21:57:44.739727+03
 dashboard             | 0001_initial                                                              | 2026-07-02 21:57:44.728726+03
 configs               | 0001_initial                                                              | 2026-07-02 21:57:43.661581+03
 tenant                | 0001_initial                                                              | 2026-07-02 21:57:41.080672+03
 billing               | 0001_initial                                                              | 2026-07-02 21:57:39.919184+03
 axes                  | 0010_accessattemptexpiration                                              | 2026-07-02 21:57:38.415498+03
 axes                  | 0009_add_session_hash                                                     | 2026-07-02 21:57:38.396977+03
 axes                  | 0008_accessfailurelog                                                     | 2026-07-02 21:57:38.38898+03
 axes                  | 0007_alter_accessattempt_unique_together                                  | 2026-07-02 21:57:38.360445+03
 axes                  | 0006_remove_accesslog_trusted                                             | 2026-07-02 21:57:38.276767+03
 axes                  | 0005_remove_accessattempt_trusted                                         | 2026-07-02 21:57:38.267774+03
 axes                  | 0004_auto_20181024_1538                                                   | 2026-07-02 21:57:38.257771+03
 axes                  | 0003_auto_20160322_0929                                                   | 2026-07-02 21:57:38.205541+03
 axes                  | 0002_auto_20151217_2044                                                   | 2026-07-02 21:57:38.168967+03
 axes                  | 0001_initial                                                              | 2026-07-02 21:57:38.10658+03
 auditlog              | 0017_add_actor_email                                                      | 2026-07-02 21:57:38.075495+03
 auditlog              | 0016_logentry_remote_port                                                 | 2026-07-02 21:57:38.00873+03
 auditlog              | 0015_alter_logentry_changes                                               | 2026-07-02 21:57:37.918845+03
 auditlog              | 0014_logentry_cid                                                         | 2026-07-02 21:57:37.803367+03
 auditlog              | 0013_alter_logentry_timestamp                                             | 2026-07-02 21:57:37.716222+03
 auditlog              | 0012_add_logentry_action_access                                           | 2026-07-02 21:57:37.665739+03
 auditlog              | 0011_logentry_serialized_data                                             | 2026-07-02 21:57:37.612129+03
 auditlog              | 0010_alter_logentry_timestamp                                             | 2026-07-02 21:57:37.566844+03
 auditlog              | 0009_alter_logentry_additional_data                                       | 2026-07-02 21:57:37.515047+03
 auditlog              | 0008_action_index                                                         | 2026-07-02 21:57:37.457435+03
 auditlog              | 0007_object_pk_type                                                       | 2026-07-02 21:57:37.407328+03
 auditlog              | 0006_object_pk_index                                                      | 2026-07-02 21:57:37.353688+03
 auditlog              | 0005_logentry_additional_data_verbose_name                                | 2026-07-02 21:57:37.290572+03
 auditlog              | 0004_logentry_detailed_object_repr                                        | 2026-07-02 21:57:37.244021+03
 auditlog              | 0003_logentry_remote_addr                                                 | 2026-07-02 21:57:37.18206+03
 auditlog              | 0002_auto_support_long_primary_keys                                       | 2026-07-02 21:57:36.946772+03
 auditlog              | 0001_initial                                                              | 2026-07-02 21:57:36.847053+03
 admin                 | 0003_logentry_add_action_flag_choices                                     | 2026-07-02 21:57:36.756643+03
 admin                 | 0002_logentry_remove_auto_add                                             | 2026-07-02 21:57:36.685283+03
 admin                 | 0001_initial                                                              | 2026-07-02 21:57:36.62705+03
 accounts              | 0001_initial                                                              | 2026-07-02 21:57:36.485288+03
 auth                  | 0012_alter_user_first_name_max_length                                     | 2026-07-02 21:57:33.325286+03
 auth                  | 0011_update_proxy_permissions                                             | 2026-07-02 21:57:33.31518+03
 auth                  | 0010_alter_group_name_max_length                                          | 2026-07-02 21:57:33.304609+03
 auth                  | 0009_alter_user_last_name_max_length                                      | 2026-07-02 21:57:33.291958+03
 auth                  | 0008_alter_user_username_max_length                                       | 2026-07-02 21:57:33.277438+03
 auth                  | 0007_alter_validators_add_error_messages                                  | 2026-07-02 21:57:33.266197+03
 auth                  | 0006_require_contenttypes_0002                                            | 2026-07-02 21:57:33.255192+03
 auth                  | 0005_alter_user_last_login_null                                           | 2026-07-02 21:57:33.252196+03
 auth                  | 0004_alter_user_username_opts                                             | 2026-07-02 21:57:33.240416+03
 auth                  | 0003_alter_user_email_max_length                                          | 2026-07-02 21:57:33.227819+03
 auth                  | 0002_alter_permission_name_max_length                                     | 2026-07-02 21:57:33.216826+03
 auth                  | 0001_initial                                                              | 2026-07-02 21:57:33.203412+03
 contenttypes          | 0002_remove_content_type_name                                             | 2026-07-02 21:57:33.125428+03
 contenttypes          | 0001_initial                                                              | 2026-07-02 21:57:33.113603+03
(133 rows)



Django Migrations

PS C:\Users\Dazlah Administrator> cd desktop/forward/falcon
PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> fasc\scripts\activate
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> py manage.py migrate
{"time": "2026-08-10 09:56:23,834", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:56:25,351", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-10 09:56:25,352", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-10 09:56:25,383", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:56:25,393", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:56:25,434", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:56:25,443", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:56:25,452", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-10 09:56:25,455", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 30m)"}
{"time": "2026-08-10 09:56:25,842", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-10 09:56:26,640", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-10 09:56:26,650", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:56:26,654", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-10 09:56:26,655", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-10 09:56:26,715", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:56:26,725", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-10 09:56:27,420", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:56:29,548", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[3d77b2cd-a71a-47a2-9720-1b8e2f7e4ead] succeeded in 0.5460000000020955s: {'status': 'success', 'created': 0}"}
Operations to perform:
  Apply all migrations: accounts, admin, auditlog, auth, axes, billing, configs, contenttypes, dashboard, db, django_apscheduler, django_celery_beat, django_celery_results, guardian, kpi, notifications, otp_static, otp_totp, reportplt, reviews, sessions, sites, structure, tenant, token_blacklist
Running migrations:
  No migrations to apply.
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> py manage.py showmigrations
{"time": "2026-08-10 09:58:00,426", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:58:01,860", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-10 09:58:01,861", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-10 09:58:01,892", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:58:01,905", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:58:01,952", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:58:01,962", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:58:01,972", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-10 09:58:01,974", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 30m)"}
{"time": "2026-08-10 09:58:02,336", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-10 09:58:03,096", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-10 09:58:03,109", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:58:03,113", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-10 09:58:03,114", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-10 09:58:03,175", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:58:03,184", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-10 09:58:03,879", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:58:05,698", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[c377dbeb-4823-40b6-9f1d-1f7b4817ea12] succeeded in 0.28199999999196734s: {'status': 'success', 'created': 0}"}
accounts
 [X] 0001_initial
 [X] 0002_user_password_history
 [X] 0003_tenantpreference_default_password_custom_value_and_more
 [X] 0004_alter_user_tenant_id
 [X] 0005_alter_permission_content_type
admin
 [X] 0001_initial
 [X] 0002_logentry_remove_auto_add
 [X] 0003_logentry_add_action_flag_choices
auditlog
 [X] 0001_initial
 [X] 0002_auto_support_long_primary_keys
 [X] 0003_logentry_remote_addr
 [X] 0004_logentry_detailed_object_repr
 [X] 0005_logentry_additional_data_verbose_name
 [X] 0006_object_pk_index
 [X] 0007_object_pk_type
 [X] 0008_action_index
 [X] 0009_alter_logentry_additional_data
 [X] 0010_alter_logentry_timestamp
 [X] 0011_logentry_serialized_data
 [X] 0012_add_logentry_action_access
 [X] 0013_alter_logentry_timestamp
 [X] 0014_logentry_cid
 [X] 0015_alter_logentry_changes
 [X] 0016_logentry_remote_port
 [X] 0017_add_actor_email
auth
 [X] 0001_initial
 [X] 0002_alter_permission_name_max_length
 [X] 0003_alter_user_email_max_length
 [X] 0004_alter_user_username_opts
 [X] 0005_alter_user_last_login_null
 [X] 0006_require_contenttypes_0002
 [X] 0007_alter_validators_add_error_messages
 [X] 0008_alter_user_username_max_length
 [X] 0009_alter_user_last_name_max_length
 [X] 0010_alter_group_name_max_length
 [X] 0011_update_proxy_permissions
 [X] 0012_alter_user_first_name_max_length
axes
 [X] 0001_initial
 [X] 0002_auto_20151217_2044
 [X] 0003_auto_20160322_0929
 [X] 0004_auto_20181024_1538
 [X] 0005_remove_accessattempt_trusted
 [X] 0006_remove_accesslog_trusted
 [X] 0007_alter_accessattempt_unique_together
 [X] 0008_accessfailurelog
 [X] 0009_add_session_hash
 [X] 0010_accessattemptexpiration
billing
 [X] 0001_initial
 [X] 0002_alter_billingauditlog_tenant_id_and_more
configs
 [X] 0001_initial
contenttypes
 [X] 0001_initial
 [X] 0002_remove_content_type_name
core
 (no migrations)
dashboard
 [X] 0001_initial
db
 [X] 0001_initial (1 squashed migrations)
 [X] 0002_alter_testmodel_id
django_apscheduler
 [X] 0001_initial
 [X] 0002_auto_20180412_0758
 [X] 0003_auto_20200716_1632
 [X] 0004_auto_20200717_1043
 [X] 0005_migrate_name_to_id
 [X] 0006_remove_djangojob_name
 [X] 0007_auto_20200717_1404
 [X] 0008_remove_djangojobexecution_started
 [X] 0009_djangojobexecution_unique_job_executions
django_celery_beat
 [X] 0001_initial
 [X] 0002_auto_20161118_0346
 [X] 0003_auto_20161209_0049
 [X] 0004_auto_20170221_0000
 [X] 0005_add_solarschedule_events_choices
 [X] 0006_auto_20180322_0932
 [X] 0007_auto_20180521_0826
 [X] 0008_auto_20180914_1922
 [X] 0006_auto_20180210_1226
 [X] 0006_periodictask_priority
 [X] 0009_periodictask_headers
 [X] 0010_auto_20190429_0326
 [X] 0011_auto_20190508_0153
 [X] 0012_periodictask_expire_seconds
 [X] 0013_auto_20200609_0727
 [X] 0014_remove_clockedschedule_enabled
 [X] 0015_edit_solarschedule_events_choices
 [X] 0016_alter_crontabschedule_timezone
 [X] 0017_alter_crontabschedule_month_of_year
 [X] 0018_improve_crontab_helptext
 [X] 0019_alter_periodictasks_options
django_celery_results
 [X] 0001_initial
 [X] 0002_add_task_name_args_kwargs
 [X] 0003_auto_20181106_1101
 [X] 0004_auto_20190516_0412
 [X] 0005_taskresult_worker
 [X] 0006_taskresult_date_created
 [X] 0007_remove_taskresult_hidden
 [X] 0008_chordcounter
 [X] 0009_groupresult
 [X] 0010_remove_duplicate_indices
 [X] 0011_taskresult_periodic_task_name
 [X] 0012_taskresult_date_started
 [X] 0013_taskresult_django_cele_periodi_1993cf_idx
 [X] 0014_alter_taskresult_status
django_rls
 (no migrations)
guardian
 [X] 0001_initial
 [X] 0002_generic_permissions_index
 [X] 0003_remove_groupobjectpermission_guardian_gr_content_ae6aec_idx_and_more
kpi
 [X] 0001_initial
 [X] 0002_alter_kpiframework_unique_together_and_more
 [X] 0003_create_materialized_views
notifications
 [X] 0001_initial
 [X] 0002_auto_20150224_1134
 [X] 0003_notification_data
 [X] 0004_auto_20150826_1508
 [X] 0005_auto_20160504_1520
 [X] 0006_indexes
 [X] 0007_add_timestamp_index
 [X] 0008_index_together_recipient_unread
 [X] 0009_alter_notification_options_and_more
 [X] 0010_rename_notification_recipient_unread_notificatio_recipie_8bedf2_idx
 [X] 0011_replace_jsonfield_with_native
 [X] 0012_gfk_indexes
 [X] 0013_alter_notification_level
otp_static
 [X] 0001_initial
 [X] 0002_throttling
 [X] 0003_add_timestamps
otp_totp
 [X] 0001_initial
 [X] 0002_auto_20190420_0723
 [X] 0003_add_timestamps
reportplt
 [X] 0001_initial
 [X] 0002_alter_report_data_source_alter_report_default_format_and_more
reviews
 [X] 0001_initial
 [X] 0002_analyticssnapshot
sessions
 [X] 0001_initial
sites
 [X] 0001_initial
 [X] 0002_alter_domain_unique
structure
 [X] 0001_initial
 [X] 0002_division_interimassignment_organizationalunit_and_more
 [X] 0003_costcenterallocation_locationallocation_and_more
tenant
 [X] 0001_initial
 [X] 0002_resourceusagesnapshot_and_more
 [X] 0003_alter_organization_status
 [X] 0004_alter_organization_status_and_more
 [X] 0005_client_tenantbackup_and_more
 [X] 0006_alter_tenantbackup_tenant_delete_client
token_blacklist
 [X] 0001_initial
 [X] 0002_outstandingtoken_jti_hex
 [X] 0003_auto_20171017_2007
 [X] 0004_auto_20171017_2013
 [X] 0005_remove_outstandingtoken_jti
 [X] 0006_auto_20171017_2113
 [X] 0007_auto_20171017_2214
 [X] 0008_migrate_to_bigautofield
 [X] 0010_fix_migrate_to_bigautofield
 [X] 0011_linearizes_history
 [X] 0012_alter_outstandingtoken_user
 [X] 0013_alter_blacklistedtoken_options_and_more
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon>



Schema Status:
(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> py manage.py tenant_migrate status --all-tenants
{"time": "2026-08-10 09:59:00,203", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:59:01,381", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-10 09:59:01,383", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-10 09:59:01,416", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:59:01,429", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:59:01,470", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:59:01,478", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:59:01,486", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-10 09:59:01,488", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 30m)"}
{"time": "2026-08-10 09:59:02,217", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-10 09:59:03,050", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-10 09:59:03,061", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:59:03,064", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-10 09:59:03,065", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-10 09:59:03,135", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:59:03,147", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-10 09:59:03,782", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:59:07,582", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[38d7a572-a6b2-4b84-a648-a47825872720] succeeded in 0.375s: {'status': 'success', 'created': 0}"}

Migration Status Report for 'Airtel' (c732f915-34d1-489d-8551-3c71bf92a372):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:15,674", "level": "INFO", "module": "migration_service", "message": "Sync complete for org c732f915-34d1-489d-8551-3c71bf92a372. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Careen' (8335eb40-dbc1-47cf-9305-d48051b90b78):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:15,847", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 8335eb40-dbc1-47cf-9305-d48051b90b78. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'DEBUG Test Org XYZ123' (2649bc5b-1071-442d-82d4-c0d739c74b87):
----------------------------------------------------------------------
  [SKIPPED] Organization 'DEBUG Test Org XYZ123' has no database schema initialized yet.
----------------------------------------------------------------------

Migration Status Report for 'FalconIGC' (52fb5df8-2350-4bd6-a5f8-22b91f441d77):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:16,100", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 52fb5df8-2350-4bd6-a5f8-22b91f441d77. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Safaricom' (f050d368-7b2f-42af-817e-d8114ae7ddf5):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:16,305", "level": "INFO", "module": "migration_service", "message": "Sync complete for org f050d368-7b2f-42af-817e-d8114ae7ddf5. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Safaricom Tech Labs' (ed505730-7b50-4f56-8206-8595493261b3):
----------------------------------------------------------------------
  [SKIPPED] Organization 'Safaricom Tech Labs' has no database schema initialized yet.
----------------------------------------------------------------------

Migration Status Report for 'Test' (275adb1f-8e12-46ee-b394-ea42d41b10c9):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:16,511", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 275adb1f-8e12-46ee-b394-ea42d41b10c9. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  accounts.0004_alter_user_tenant_id                     [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Test Company One 5f94bf' (de765661-2474-4d82-aa81-83b9a48124b0):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:16,696", "level": "INFO", "module": "migration_service", "message": "Sync complete for org de765661-2474-4d82-aa81-83b9a48124b0. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Test Company One 896e05' (d891d28d-8510-49bc-afd4-446537d28469):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:16,879", "level": "INFO", "module": "migration_service", "message": "Sync complete for org d891d28d-8510-49bc-afd4-446537d28469. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Test Company One 91565b' (786ee6fc-244f-4225-8d2e-88815217478c):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:17,092", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 786ee6fc-244f-4225-8d2e-88815217478c. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Test Company One ea454a' (49f52ebd-d2b6-4fd1-a0d5-f8b424c23b01):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:17,271", "level": "INFO", "module": "migration_service", "message": "Sync complete for org 49f52ebd-d2b6-4fd1-a0d5-f8b424c23b01. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------

Migration Status Report for 'Test Company Two 896e05' (a2f70844-71ea-40ce-bf8f-2ca8d90f2376):
----------------------------------------------------------------------
{"time": "2026-08-10 09:59:17,450", "level": "INFO", "module": "migration_service", "message": "Sync complete for org a2f70844-71ea-40ce-bf8f-2ca8d90f2376. Created: 0, Updated: 0"}
  reportplt.0002_alter_report_data_source_alter_report_default_format_and_more [COMPLETED]
  reportplt.0001_initial                                  [COMPLETED]
  reviews.0002_analyticssnapshot                        [COMPLETED]
  kpi.0003_create_materialized_views                [COMPLETED]
  dashboard.0001_initial                                  [COMPLETED]
  reviews.0001_initial                                  [COMPLETED]
  kpi.0002_alter_kpiframework_unique_together_and_more [COMPLETED]
  kpi.0001_initial                                  [COMPLETED]
  structure.0003_costcenterallocation_locationallocation_and_more [COMPLETED]
  structure.0002_division_interimassignment_organizationalunit_and_more [COMPLETED]
  structure.0001_initial                                  [COMPLETED]
  accounts.0003_tenantpreference_default_password_custom_value_and_more [COMPLETED]
  accounts.0002_user_password_history                    [COMPLETED]
  accounts.0001_initial                                  [COMPLETED]
----------------------------------------------------------------------



But now when I initialize the django server, it is telling me I have 20 unapplied migrations

(fasc) PS C:\Users\Dazlah Administrator\Desktop\Forward\Falcon> py manage.py runserver

============================================================
Falcon PMS - Development server starting...

============================================================
Time: 2026-08-10 09:54:56
Python: 3.11.9
Project: C:\Users\Dazlah Administrator\Desktop\Forward
============================================================

{"time": "2026-08-10 09:54:58,992", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:55:00,714", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-10 09:55:00,715", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-10 09:55:00,755", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:55:00,769", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:55:00,813", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:55:00,825", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:55:00,833", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-10 09:55:00,835", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 30m)"}
{"time": "2026-08-10 09:55:01,316", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-10 09:55:03,688", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-10 09:55:03,703", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:55:03,708", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-10 09:55:03,710", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-10 09:55:03,803", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:55:03,822", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-10 09:55:05,448", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:55:08,920", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[6e2dfe56-7254-478d-8002-9d14766b30f0] succeeded in 0.375s: {'status': 'success', 'created': 0}"}

============================================================
Falcon PMS - Development server starting...

============================================================
Time: 2026-08-10 09:55:10
Python: 3.11.9
Project: C:\Users\Dazlah Administrator\Desktop\Forward
============================================================

{"time": "2026-08-10 09:55:15,247", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:55:17,387", "level": "INFO", "module": "connection_cleanup", "message": "Cleaned up 2 stale database connection records on startup."}
{"time": "2026-08-10 09:55:17,389", "level": "INFO", "module": "connection_service", "message": "Pre-warming connection pool..."}
{"time": "2026-08-10 09:55:17,428", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:55:17,440", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: c732f915-34d1-489d-8551-3c71bf92a372 (read_only: False)"}
{"time": "2026-08-10 09:55:17,477", "level": "DEBUG", "module": "connection_service", "message": "Getting connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:55:17,489", "level": "INFO", "module": "connection_service", "message": "Creating connection for organization: 8335eb40-dbc1-47cf-9305-d48051b90b78 (read_only: False)"}
{"time": "2026-08-10 09:55:17,497", "level": "INFO", "module": "connection_cleanup", "message": "Pre-warmed 2 tenant database connections during scheduler startup."}
{"time": "2026-08-10 09:55:17,500", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started (interval: 60s, idle timeout: 30m)"}
{"time": "2026-08-10 09:55:17,889", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}
{"time": "2026-08-10 09:55:18,762", "level": "DEBUG", "module": "__init__", "message": "matplotlib data path: C:\\Users\\Dazlah Administrator\\Desktop\\Forward\\Falcon\\fasc\\Lib\\site-packages\\matplotlib\\mpl-data"}
{"time": "2026-08-10 09:55:18,776", "level": "DEBUG", "module": "__init__", "message": "CONFIGDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:55:18,781", "level": "DEBUG", "module": "__init__", "message": "interactive is False"}
{"time": "2026-08-10 09:55:18,783", "level": "DEBUG", "module": "__init__", "message": "platform is win32"}
{"time": "2026-08-10 09:55:18,853", "level": "DEBUG", "module": "__init__", "message": "CACHEDIR=C:\\Users\\Dazlah Administrator\\.matplotlib"}
{"time": "2026-08-10 09:55:18,867", "level": "DEBUG", "module": "font_manager", "message": "Using fontManager instance from C:\\Users\\Dazlah Administrator\\.matplotlib\\fontlist-v3.11.0.json"}
{"time": "2026-08-10 09:55:19,583", "level": "DEBUG", "module": "pyplot", "message": "Loaded backend Agg version v2.2."}
C:\Users\Dazlah Administrator\Desktop\Forward\Falcon\fasc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-08-10 09:55:21,498", "level": "INFO", "module": "trace", "message": "Task apps.reportplt.tasks.sync_report_templates[1b45b82e-6491-473f-8a1f-fc0cd608849c] succeeded in 0.1879999999946449s: {'status': 'success', 'created': 0}"}
{"time": "2026-08-10 09:55:21,651", "level": "INFO", "module": "autoreload", "message": "Watching for file changes with StatReloader"}
Performing system checks...

System check identified no issues (0 silenced).

You have 20 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): accounts, billing, notifications, reportplt, reviews, tenant.
Run 'python manage.py migrate' to apply them.
August 10, 2026 - 09:55:25
Django version 5.2.12, using settings 'config.settings.development'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.

WARNING: This is a development server. Do not use it in a production setting. Use a production WSGI or ASGI server instead.
For more information on production servers see: https://docs.djangoproject.com/en/5.2/howto/deployment/