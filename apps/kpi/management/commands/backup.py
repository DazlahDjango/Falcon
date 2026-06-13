import os
import subprocess
import json
import boto3
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Perform system backup'
    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            choices=['full', 'database', 'media', 'config'],
            default='full',
            help='Type of backup to perform'
        )
        parser.add_argument(
            '--destination',
            choices=['local', 's3', 'both'],
            default='both',
            help='Backup destination'
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            default=True,
            help='Compress backup files'
        )
        parser.add_argument(
            '--encrypt',
            action='store_true',
            default=False,
            help='Encrypt backup files'
        )

    def handle(self, *args, **options):
        backup_type = options['type']
        destination = options['destination']
        compress = options['compress']
        encrypt = options['encrypt']

        self.stdout.write(self.style.SUCCESS(f'Starting {backup_type} backup...'))

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = f'/tmp/backup_{timestamp}'
        os.makedirs(backup_dir, exist_ok=True)

        results = {}

        try:
            # Database Backup
            if backup_type in ['full', 'database']:
                results['database'] = self._backup_database(backup_dir, timestamp, compress, encrypt)

            # Media Files Backup
            if backup_type in ['full', 'media']:
                results['media'] = self._backup_media(backup_dir, timestamp, compress, encrypt)

            # Configuration Backup
            if backup_type in ['full', 'config']:
                results['config'] = self._backup_config(backup_dir, timestamp, compress, encrypt)

            # Upload to destination
            if destination in ['s3', 'both']:
                self._upload_to_s3(backup_dir, timestamp)

            # Cleanup local files if not keeping
            if destination == 's3':
                import shutil
                shutil.rmtree(backup_dir)

            # Create backup record
            self._record_backup(timestamp, backup_type, destination, results)

            self.stdout.write(self.style.SUCCESS(f'Backup completed: {timestamp}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Backup failed: {str(e)}'))
            logger.exception("Backup failed")
            raise

    def _backup_database(self, backup_dir, timestamp, compress, encrypt):
        """Backup PostgreSQL database"""
        self.stdout.write("  Backing up database...")

        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_host = settings.DATABASES['default'].get('HOST', 'localhost')
        db_port = settings.DATABASES['default'].get('PORT', 5432)

        dump_file = os.path.join(backup_dir, f'database_{timestamp}.dump')

        # Use pg_dump
        cmd = [
            'pg_dump',
            '-h', db_host,
            '-p', str(db_port),
            '-U', db_user,
            '-F', 'c',  # Custom format
            '-f', dump_file,
            db_name
        ]

        # Set PGPASSWORD environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = settings.DATABASES['default']['PASSWORD']

        result = subprocess.run(cmd, env=env, capture_output=True)

        if result.returncode != 0:
            raise Exception(f"pg_dump failed: {result.stderr.decode()}")

        file_size = os.path.getsize(dump_file)
        self.stdout.write(f"    Database dump size: {file_size / 1024 / 1024:.2f} MB")

        # Compress if needed
        if compress:
            compressed_file = self._compress_file(dump_file)
            os.remove(dump_file)
            dump_file = compressed_file

        # Encrypt if needed
        if encrypt:
            dump_file = self._encrypt_file(dump_file)

        return {
            'file': dump_file,
            'size': file_size,
            'compressed': compress,
            'encrypted': encrypt
        }

    def _backup_media(self, backup_dir, timestamp, compress, encrypt):
        """Backup media files"""
        self.stdout.write("  Backing up media files...")

        media_root = settings.MEDIA_ROOT
        media_file = os.path.join(backup_dir, f'media_{timestamp}.tar.gz')

        # Create tar archive
        import tarfile
        with tarfile.open(media_file, 'w:gz') as tar:
            tar.add(media_root, arcname='media')

        file_size = os.path.getsize(media_file)

        # Encrypt if needed
        if encrypt:
            media_file = self._encrypt_file(media_file)

        return {
            'file': media_file,
            'size': file_size,
            'compressed': True,
            'encrypted': encrypt
        }

    def _backup_config(self, backup_dir, timestamp, compress, encrypt):
        """Backup configuration files"""
        self.stdout.write("  Backing up configuration...")

        config_files = [
            '.env',
            'settings.py',
            'nginx.conf',
            'docker-compose.yml'
        ]

        config_dir = os.path.join(backup_dir, f'config_{timestamp}')
        os.makedirs(config_dir)

        for file in config_files:
            if os.path.exists(file):
                import shutil
                shutil.copy2(file, config_dir)

        # Create archive
        config_file = os.path.join(backup_dir, f'config_{timestamp}.tar.gz')
        import tarfile
        with tarfile.open(config_file, 'w:gz') as tar:
            tar.add(config_dir, arcname='config')

        import shutil
        shutil.rmtree(config_dir)

        if encrypt:
            config_file = self._encrypt_file(config_file)

        return {
            'file': config_file,
            'size': os.path.getsize(config_file),
            'compressed': True,
            'encrypted': encrypt
        }

    def _compress_file(self, file_path):
        """Compress a single file"""
        import gzip
        import shutil

        compressed_path = f"{file_path}.gz"
        with open(file_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        return compressed_path

    def _encrypt_file(self, file_path):
        import gnupg

        gpg = gnupg.GPG()
        with open(file_path, 'rb') as f:
            encrypted_data = gpg.encrypt_file(
                f,
                recipients=[settings.BACKUP_GPG_KEY_ID],
                output=f"{file_path}.gpg"
            )

        os.remove(file_path)
        return f"{file_path}.gpg"

    def _upload_to_s3(self, backup_dir, timestamp):
        """Upload backup files to S3"""
        self.stdout.write("  Uploading to S3...")

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

        bucket = settings.BACKUP_BUCKET
        prefix = f"backups/{timestamp}/"

        for root, dirs, files in os.walk(backup_dir):
            for file in files:
                file_path = os.path.join(root, file)
                s3_key = f"{prefix}{file}"

                s3_client.upload_file(
                    file_path,
                    bucket,
                    s3_key,
                    ExtraArgs={'StorageClass': 'STANDARD_IA'}
                )
                self.stdout.write(f"    Uploaded: {s3_key}")

    def _record_backup(self, timestamp, backup_type, destination, results):
        """Record backup in database"""
        from ...models import BackupRecord

        BackupRecord.objects.create(
            timestamp=timestamp,
            backup_type=backup_type,
            destination=destination,
            size=sum(r.get('size', 0) for r in results.values()),
            files=results,
            status='SUCCESS'
        )