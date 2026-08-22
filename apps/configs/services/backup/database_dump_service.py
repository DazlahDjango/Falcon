import os
import shutil
import subprocess
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class DatabaseDumpService:
    """
    Executes PostgreSQL database dumps (pg_dump) and restores (pg_restore)
    passing credentials strictly via process-isolated environment variables (PGPASSWORD)
    to prevent credential exposure in system process monitors (ps aux).
    """

    @staticmethod
    def is_pg_dump_available() -> bool:
        """Check if pg_dump CLI utility is present in environment PATH."""
        return shutil.which('pg_dump') is not None

    @staticmethod
    def is_pg_restore_available() -> bool:
        """Check if pg_restore CLI utility is present in environment PATH."""
        return shutil.which('pg_restore') is not None

    def _get_db_env(self):
        db_config = settings.DATABASES['default']
        env = os.environ.copy()
        db_password = db_config.get('PASSWORD', '')
        if db_password:
            env['PGPASSWORD'] = str(db_password)

        # Resolve host & port for pg_dump / pg_restore:
        # pg_dump and pg_restore require direct connection to PostgreSQL (port 5432)
        # because PgBouncer in transaction mode (port 6432) does not support dump/restore sessions.
        host = getattr(settings, 'DB_DIRECT_HOST', None) or os.environ.get('DB_DIRECT_HOST') or db_config.get('HOST', 'localhost') or 'localhost'
        port = getattr(settings, 'DB_DIRECT_PORT', None) or os.environ.get('DB_DIRECT_PORT')
        if not port:
            configured_port = str(db_config.get('PORT', 5432) or 5432)
            if configured_port == '6432':  # PgBouncer port
                port = '5432'              # Bypass PgBouncer for direct Postgres connection
            else:
                port = configured_port

        db_info = {
            'HOST': host,
            'PORT': str(port),
            'USER': db_config.get('USER', 'postgres'),
            'NAME': db_config.get('NAME', ''),
        }
        return env, db_info

    def dump_tenant_schema(self, schema_name: str, output_file_path: str) -> bool:
        env, db_config = self._get_db_env()
        cmd = [
            'pg_dump',
            '-h', db_config['HOST'],
            '-p', db_config['PORT'],
            '-U', db_config['USER'],
            '-d', db_config['NAME'],
            '-n', schema_name,
            '-F', 'c',
            '-f', output_file_path
        ]

        try:
            logger.info(f"Executing secure pg_dump for schema '{schema_name}'...")
            subprocess.run(cmd, env=env, check=True, capture_output=True)
            logger.info(f"Schema dump completed for '{schema_name}' -> {output_file_path}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            err = e.stderr.decode('utf-8', errors='ignore') if isinstance(e, subprocess.CalledProcessError) else str(e)
            logger.error(f"pg_dump failed for schema '{schema_name}': {err}")
            return False

    def dump_app_table(self, table_name: str) -> bytes | None:
        """Dump a specific database table to binary custom format bytes."""
        if not self.is_pg_dump_available():
            return None
        env, db_config = self._get_db_env()
        cmd = [
            'pg_dump',
            '-h', db_config['HOST'],
            '-p', db_config['PORT'],
            '-U', db_config['USER'],
            '-d', db_config['NAME'],
            '-t', table_name,
            '-F', 'c',
        ]
        try:
            logger.info(f"Executing secure pg_dump for table '{table_name}'...")
            result = subprocess.run(cmd, env=env, check=True, capture_output=True)
            return result.stdout
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            err = e.stderr.decode('utf-8', errors='ignore') if isinstance(e, subprocess.CalledProcessError) else str(e)
            logger.error(f"pg_dump failed for table '{table_name}': {err}")
            return None

    def restore_app_table(self, dump_bytes: bytes) -> bool:
        """Restore database state from binary custom dump bytes using pg_restore."""
        if not self.is_pg_restore_available():
            return False
        env, db_config = self._get_db_env()
        cmd = [
            'pg_restore',
            '-h', db_config['HOST'],
            '-p', db_config['PORT'],
            '-U', db_config['USER'],
            '-d', db_config['NAME'],
            '--clean',
            '--if-exists',
        ]
        try:
            logger.info("Executing secure pg_restore...")
            subprocess.run(cmd, input=dump_bytes, env=env, check=True, capture_output=True)
            logger.info("pg_restore completed successfully")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            err = e.stderr.decode('utf-8', errors='ignore') if isinstance(e, subprocess.CalledProcessError) else str(e)
            logger.error(f"pg_restore failed: {err}")
            return False

