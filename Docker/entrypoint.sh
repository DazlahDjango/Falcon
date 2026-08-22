#!/bin/sh
set -e

# Wait for PostgreSQL / PgBouncer if configured
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database ($DB_HOST:${DB_PORT:-5432}) to become ready..."
    until PGPASSWORD="${DB_PASSWORD}" pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; do
        echo "Database is unavailable - sleeping 2s"
        sleep 2
    done
    echo "Database is ready!"
fi

# Run migrations and collectstatic for primary web server nodes
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$CONTAINER_ROLE" = "primary_web" ]; then
    echo "Running database migrations..."
    python manage.py migrate --noinput

    echo "Collecting static files..."
    python manage.py collectstatic --noinput --clear
fi

echo "Starting container process: $@"
exec "$@"
