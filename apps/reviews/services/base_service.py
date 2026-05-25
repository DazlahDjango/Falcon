from django.core.exceptions import ValidationError
from django.db import transaction

class BaseReviewService:
    @staticmethod
    def handle_errors(func):
        """Decorator for consistent error handling"""
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except ValidationError as e:
                raise e
            except Exception as e:
                raise ValidationError(f"Service error: {str(e)}")
        return wrapper
    
    @staticmethod
    @transaction.atomic
    def atomic_operation(func):
        """Decorator for atomic database transactions"""
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    
    @staticmethod
    def get_object_or_none(model, **kwargs):
        """Safely get object or return None"""
        try:
            return model.objects.get(**kwargs)
        except model.DoesNotExist:
            return None