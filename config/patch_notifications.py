"""
Patch for django-notifications compatibility with Django 5+
Converts deprecated index_together to indexes
"""

import warnings
from django.db import models

def apply_notifications_patch():
    """
    Monkey patch to fix index_together deprecation in Django 5+
    """
    try:
        from notifications.base.models import AbstractNotification
        
        # Store the original Meta class
        original_meta = AbstractNotification._meta
        
        # Create new indexes from index_together
        if hasattr(original_meta, 'original_attrs') and 'index_together' in original_meta.original_attrs:
            index_together = original_meta.original_attrs['index_together']
            
            # Convert to indexes
            from django.db.models import Index
            new_indexes = []
            for fields in index_together:
                new_indexes.append(Index(fields=fields))
            
            # Add the indexes
            if not hasattr(original_meta, 'indexes'):
                original_meta.indexes = []
            original_meta.indexes.extend(new_indexes)
            
            # Remove index_together from original_attrs to prevent error
            if 'index_together' in original_meta.original_attrs:
                del original_meta.original_attrs['index_together']
                
        print("✓ Successfully patched django-notifications for Django 5+")
        
    except ImportError:
        # Notifications not installed, skip patch
        pass
    except Exception as e:
        print(f"⚠ Warning: Could not patch notifications: {e}")