"""
Patch for django-health-check to defer settings access until runtime.
"""
import sys

def apply_health_check_patch():
    """Apply monkey patches to health_check before Django loads."""
    try:
        import django
        from django.conf import settings
        
        # We need to import health_check but it will fail on import
        # So we'll patch the module after it's imported
        import health_check
        
        # Store the original Mail class
        original_mail = health_check.checks.Mail
        
        # Create a patched version that accesses settings at runtime
        class PatchedMail(original_mail):
            def __init__(self):
                # Now settings are configured
                super().__init__()
            
            @property
            def backend(self):
                if not hasattr(self, '_backend'):
                    from django.conf import settings
                    self._backend = settings.EMAIL_BACKEND
                return self._backend
        
        # Replace the original
        health_check.checks.Mail = PatchedMail
        print("✓ Patched health_check.Mail to defer settings access")
        
        # Also patch any other classes that might access settings at import
        # For example, if there's a Database class with similar issues
        
    except ImportError:
        # health_check not installed
        pass
    except Exception as e:
        print(f"⚠ Warning: Could not patch health_check: {e}")