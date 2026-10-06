#!/bin/sh
set -e

# Wait for PostgreSQL / PgBouncer if DB_HOST is set
if [ -n "$DB_HOST" ]; then
    echo "[Falcon Entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT:-5432}..."
    until PGPASSWORD="${DB_PASSWORD}" pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; do
        echo "[Falcon Entrypoint] Database unavailable - sleeping 2s"
        sleep 2
    done
    echo "[Falcon Entrypoint] Database connection established!"
fi

# Run database migrations and static collection if role is primary_web or RUN_MIGRATIONS=true
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$CONTAINER_ROLE" = "primary_web" ]; then
    echo "[Falcon Entrypoint] Executing database migrations..."
    python manage.py migrate --noinput

    echo "[Falcon Entrypoint] Collecting static assets..."
    python manage.py collectstatic --noinput --clear
fi

echo "[Falcon Entrypoint] Starting process: $@"
exec "$@"
