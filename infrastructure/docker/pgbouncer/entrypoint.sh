#!/bin/sh
set -e

USERLIST_FILE="/etc/pgbouncer/userlist.txt"

if [ ! -f "$USERLIST_FILE" ]; then
    echo "[PgBouncer Entrypoint] Generating userlist file..."
    DB_USER=${DB_USER:-postgres}
    DB_PASSWORD=${DB_PASSWORD:-postgres}
    
    # Calculate md5 hash for PgBouncer auth
    PASS_HASH=$(echo -n "${DB_PASSWORD}${DB_USER}" | md5sum | awk '{print $1}')
    echo "\"${DB_USER}\" \"md5${PASS_HASH}\"" > "$USERLIST_FILE"
fi

echo "[PgBouncer Entrypoint] Starting PgBouncer..."
exec "$@"
