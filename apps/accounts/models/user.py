# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Start with just the fields you KNOW you'll need
    phone_number = models.CharField(max_length=15, blank=True)
    
    # Skip complex relationships for now
    # organisation = models.ForeignKey(...)  ← Add this later
    
    def __str__(self):
        return self.email or self.username
    
    class Meta:
        db_table = 'accounts_user'
        ordering = ['-date_joined']