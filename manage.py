#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import time
import warnings
from pathlib import Path

# ===== DIRECT PATCH FOR NOTIFICATIONS =====
import django.db.models.options as options
if 'index_together' not in options.DEFAULT_NAMES:
    options.DEFAULT_NAMES = options.DEFAULT_NAMES + ('index_together',)

original_init = options.Options.__init__
def patched_init(self, meta, app_label=None):
    original_init(self, meta, app_label)
    self.index_together = []

options.Options.__init__ = patched_init

original_contribute_to_class = options.Options.contribute_to_class
def patched_contribute_to_class(self, cls, name):
    original_contribute_to_class(self, cls, name)
    self.index_together = options.normalize_together(self.index_together)
    if 'index_together' in self.original_attrs:
        self.original_attrs['index_together'] = self.index_together

options.Options.contribute_to_class = patched_contribute_to_class
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
