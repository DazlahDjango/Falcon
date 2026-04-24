import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.accounts.models import User

def check_cycles():
    users = User.objects.all()
    for user in users:
        visited = set()
        current = user
        path = []
        while current and current.id not in visited:
            visited.add(current.id)
            path.append(current.email)
            current = current.manager
        if current:
            print(f"CYCLE DETECTED: {' -> '.join(path)} -> {current.email}")
            return True
    print("No cycles detected in management chain.")
    return False

if __name__ == "__main__":
    check_cycles()
