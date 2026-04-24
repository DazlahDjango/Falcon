import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.accounts.models import User
from django.db import transaction

def repair_cycles():
    users = list(User.objects.all())
    print(f"Scanning {len(users)} users for management cycles...")
    
    cycles_found = 0
    for user in users:
        visited = set()
        path = []
        current = user
        
        while current and current.id not in visited:
            visited.add(current.id)
            path.append(current)
            current = current.manager
            
        if current:
            # Cycle detected
            cycles_found += 1
            # Find where the cycle starts
            cycle_start_index = 0
            for i, node in enumerate(path):
                if node.id == current.id:
                    cycle_start_index = i
                    break
            
            cycle_path = path[cycle_start_index:]
            path_str = " -> ".join([u.email for u in cycle_path]) + f" -> {current.email}"
            print(f"CYCLE DETECTED: {path_str}")
            
            # Break the cycle by setting the manager of the first user in the cycle to None
            # We use the 'current' which is the manager that points back into the path
            with transaction.atomic():
                # We need to find which user has 'current' as manager and is in the cycle
                # Actually, the simplest is to break it at the user we started with if they are in the cycle
                target = cycle_path[-1]
                print(f"BREAKING CYCLE at user: {target.email}")
                target.manager = None
                target.save(update_fields=['manager'])
                
    print(f"Repair complete. Total cycles broken: {cycles_found}")

if __name__ == "__main__":
    repair_cycles()
