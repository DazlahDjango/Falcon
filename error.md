# Intro
Good afternoon, I'm gladi having you to help me today with something here on tenants app, we'll be going module by module today, I have several modules/elements in tenant
Today we're focusing only in a single module and that's migrations module, as you can see in those picture schema is showing but the migration part is no migrations

# To-Do list
1. Review all the tenant backend files and make sure my migrations file is good enough, solid, production ready, enterprise production ready scaling all types of migrations/databases migrations, secured(Anywhere you might think I need encryption, I have all the Django/python libraries for encryption i.e cryptography etc)
2. We can try if you think this is good for the migrations files to achieve the following that I've researched on:
        *** My Research ***
        Enterprise-Grade Migration Checklist
    1. Migration Files Structure
    Separate up and down migrations - Always provide rollback capability for every migration

    2. Version Control
    Semantic versioning - Use YYYYMMDD_HHMMSS_description.sql format for easy tracking

    3. Pre-Migration Checks
    Validate schema exists before applying any migration to a tenant

    4. Post-Migration Verification
    Verify migration success by checking row counts or data integrity after execution

    5. Dry-Run Mode
    Preview SQL before executing to catch errors in production

    6. Error Handling & Rollback
    Atomic transactions - Rollback entire migration if any step fails

    7. Idempotency
    Check if migration already applied before running (prevent duplicate execution)

    8. Database Locking Strategy
    Use advisory locks or FOR UPDATE to prevent concurrent migrations on same tenant

    9. Audit Logging
    Log who applied the migration, when, and execution time for compliance

    10. Monitoring & Alerts
    Alert on migration failures via email/Slack for immediate action

    11. Batch Processing for Large Tenants
    Process data in chunks (e.g., 1000 rows at a time) to avoid timeouts

    12. Tenant-Specific Configurations
    Allow per-tenant migration overrides (some tenants may skip certain migrations)

    13. Parallel Execution Management
    Run migrations for different tenants in parallel but sequential per tenant

    14. Performance Optimization
    Add proper indexes before running large data migrations

    15. Database Compatibility
    Support multiple database backends (PostgreSQL, MySQL, SQLite) if needed though here I'm based on Postures only 

    16. Sensitive Data Protection
    Never store passwords, API keys, or PII in migration files - use environment variables or runtime generation

    17. Migration Dependencies
    Define dependency tree so migrations run in correct order (app-level + cross-app)

    18. Scheduled vs Manual Migrations
    Auto-apply non-breaking migrations (e.g., new fields) but require approval for breaking changes

    21. Data Migration vs Schema Migration
    Separate schema changes (DDL) from data migrations (DML) for better control

    22. Backup Strategy
    Create database backup before running any migration on production
    N/B -> This is being handled by the config app though

    23. Migration Metadata
    Store execution time, affected rows, and status for each migration run

    24. User Notification
    Notify admins when migrations complete or require manual intervention

    25. Rollback Plan
    Always have a tested rollback plan ready for every migration

3. Make sure we're just working with migrations files only and nothing else please that'd be good if we maintain it only 
4. You can finalize by telling what you changed, all improvements and how it satisfys all my requirements 


## - Task 2:
We've finished fixing backend now it's time for frontend, make sure my frontend migrations files now satistfy what we've updated in the backend
where to get the files
API calling is in the config/constants/tenantApiConstants
services/tenant/migration.service.js
store/tenant/slice/migration.slice.js
store/tenant/selectors/migration.selectors.js
components/tenant/migrations/ directory(here you can add more files you need if you don't mind, it's not a must you use the ones that I have onyl, you can add as many as you want, in a way that we can have detail files and all the actions needed for migrations with full migrations files) then it's tyle file is in the same directory migrations.css
Lets start