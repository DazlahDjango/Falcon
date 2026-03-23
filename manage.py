#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import time
import warnings
from pathlib import Path

# ===== DIRECT PATCH FOR NOTIFICATIONS =====
# This runs BEFORE Django loads the models
from django.db import models

# Store the original options class
original_options = models.options.Options

# Create a patched version that handles index_together
class PatchedOptions(original_options):
    def __init__(self, meta, app_label):
        # Convert index_together to indexes before Django processes it
        if hasattr(meta, 'index_together') and meta.index_together:
            if not hasattr(meta, 'indexes'):
                meta.indexes = []
            
            from django.db.models import Index
            for fields in meta.index_together:
                meta.indexes.append(Index(fields=fields))
            
            # Remove index_together to prevent error
            if hasattr(meta, 'index_together'):
                delattr(meta, 'index_together')
        
        # Call the original __init__
        super().__init__(meta, app_label)

# Apply the patch
models.options.Options = PatchedOptions
# ===== END PATCH =====



def main():
    """Run administrative tasks."""
    DJANGO_ENV = os.environ.get('DJANGO_ENV', 'development')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'config.settings.{DJANGO_ENV}')
    BASE_DIR = Path(__file__).resolve().parent.parent
    sys.path.append(str(BASE_DIR / 'apps'))
    # Py version
    if sys.version_info < (3, 11):
        print("Falcon PMS requires python 3.11 or higher")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    # Development server
    if 'runserver' in sys.argv and '--noreload' not in sys.argv:
        print('\n' + "="*60)
        print("Falcon PMS - Development server starting...")
        print('\n' + "="*60)
        print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Python: {sys.version.split()[0]}")
        print(f"Project: {BASE_DIR}")
        print('='*60 + '\n')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # Filter out specific warnings in development
    if 'test' not in sys.argv:
        warnings.filterwarnings('ignore', '.*content_type parameter is deprecated.*')
        warnings.filterwarnings('ignore', '.*SimpleTestCase.*')

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
