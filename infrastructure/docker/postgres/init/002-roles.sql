-- Define RBAC Roles for Database Access & Security Scoping
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'migration_role') THEN
        CREATE ROLE migration_role WITH CREATEDB CREATEROLE LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'application_role') THEN
        CREATE ROLE application_role WITH LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_role') THEN
        CREATE ROLE readonly_role WITH LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'reporting_role') THEN
        CREATE ROLE reporting_role WITH LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'backup_role') THEN
        CREATE ROLE backup_role WITH REPLICATION LOGIN;
    END IF;
END $$;
