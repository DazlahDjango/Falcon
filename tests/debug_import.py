import os
import sys
import django

# Add project root to sys.path
project_root = r"c:\Users\Dazlah Administrator\Desktop\Falcon_pms"
if project_root not in sys.path:
    sys.path.insert(0, project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

try:
    print("Attempting to import apps.configs.services...")
    import apps.configs.services
    print("Successfully imported apps.configs.services!")
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    print("\nAttempting django.setup()...")
    django.setup()
    print("Django setup completed successfully!")
except Exception as e:
    import traceback
    print("Django setup failed:")
    traceback.print_exc()

