"""
Avatar service - Avatar upload and management.
"""

import os
import uuid
import logging
from typing import Optional, Tuple
from PIL import Image
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from apps.accounts.models import Profile
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)


class AvatarService:
    def __init__(self):
        self.audit_service = AuditService()
        self.max_size = 5 * 1024 * 1024  # 5MB
        self.allowed_formats = ['JPEG', 'PNG', 'GIF', 'WEBP']
        self.avatar_sizes = {
            'small': (32, 32),
            'medium': (64, 64),
            'large': (128, 128),
            'original': None
        }
    
    def upload_avatar(self, user, file, request=None) -> Tuple[bool, str, Optional[str]]:
        is_valid, error = self._validate_file(file)
        if not is_valid:
            return False, error, None
        try:
            processed_file, filename = self._process_image(file, user.id)
            path = default_storage.save(filename, processed_file)
            url = default_storage.url(path)
            profile = Profile.objects.get(user=user)
            if profile.avatar and profile.avatar.name:
                default_storage.delete(profile.avatar.name)
            profile.avatar = path
            profile.save(update_fields=['avatar'])
            self.audit_service.log(
                user=user, action='profile.avatar_uploaded', action_type='update',
                request=request, severity='info'
            )
            return True, 'Avatar uploaded successfully.', url
        except Exception as e:
            logger.error(f"Avatar upload error: {str(e)}")
            return False, 'Unable to upload avatar.', None
    
    def delete_avatar(self, user, request=None) -> Tuple[bool, str]:
        try:
            profile = Profile.objects.get(user=user)
            if profile.avatar and profile.avatar.name:
                default_storage.delete(profile.avatar.name)
                profile.avatar = None
                profile.save(update_fields=['avatar'])
            self.audit_service.log(
                user=user, action='profile.avatar_deleted', action_type='update',
                request=request, severity='info'
            )
            return True, 'Avatar deleted successfully.'
        except Exception as e:
            logger.error(f"Avatar delete error: {str(e)}")
            return False, 'Unable to delete avatar.'
    
    def _validate_file(self, file) -> Tuple[bool, str]:
        if file.size > self.max_size:
            return False, f'File size exceeds {self.max_size // (1024 * 1024)}MB limit.'
        try:
            img = Image.open(file)
            if img.format not in self.allowed_formats:
                return False, f'File format not supported. Allowed: {", ".join(self.allowed_formats)}'
            file.seek(0)
        except Exception:
            return False, 'Invalid image file.'
        return True, ''
    
    def _process_image(self, file, user_id) -> Tuple[ContentFile, str]:
        img = Image.open(file)
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        # Generate filename
        ext = file.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            ext = 'jpg'
        filename = f'avatars/{user_id}/{uuid.uuid4().hex}.{ext}'
        # Resize if too large (max 500px)
        max_dimension = 500
        if img.width > max_dimension or img.height > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        # Save to buffer
        from io import BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG' if ext in ['jpg', 'jpeg'] else ext.upper(), quality=85)
        buffer.seek(0)
        return ContentFile(buffer.read()), filename