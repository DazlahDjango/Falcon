#!/bin/sh
set -e

# Wait for PostgreSQL
if [ -n "$DB_HOST" ]; then
    echo "[Falcon Celery Entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT:-5432}..."
    until PGPASSWORD="${DB_PASSWORD}" pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; do
        echo "[Falcon Celery Entrypoint] DB unavailable - sleeping 2s"
        sleep 2
    done
    echo "[Falcon Celery Entrypoint] Database is ready!"
fi

# Wait for Redis Broker
if [ -n "$REDIS_URL" ]; then
    echo "[Falcon Celery Entrypoint] Celery broker configured: ${REDIS_URL}"
fi

echo "[Falcon Celery Entrypoint] Launching Celery process: $@"
exec "$@"
