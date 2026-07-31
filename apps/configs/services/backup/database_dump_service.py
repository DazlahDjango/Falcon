import os
import subprocess
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class DatabaseDumpService:
    """
    Executes PostgreSQL database dumps (pg_dump) passing credentials strictly
    via process-isolated environment variables (PGPASSWORD) to prevent credential
    exposure in system process monitors (ps aux).
    """

    def dump_tenant_schema(self, schema_name: str, output_file_path: str) -> bool:
        db_config = settings.DATABASES['default']
        db_name = db_config.get('NAME')
        db_user = db_config.get('USER')
        db_password = db_config.get('PASSWORD', '')
        db_host = db_config.get('HOST', 'localhost')
        db_port = str(db_config.get('PORT', 5432))

        # Inject password into isolated process environment dictionary
        env = os.environ.copy()
        if db_password:
            env['PGPASSWORD'] = db_password

        cmd = [
            'pg_dump',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-d', db_name,
            '-n', schema_name,
            '-F', 'c',
            '-f', output_file_path
        ]

        try:
            logger.info(f"Executing secure pg_dump for schema '{schema_name}'...")
            subprocess.run(cmd, env=env, check=True, capture_output=True)
            logger.info(f"Schema dump completed for '{schema_name}' -> {output_file_path}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"pg_dump failed for schema '{schema_name}': {e.stderr.decode('utf-8', errors='ignore')}")
            return False
