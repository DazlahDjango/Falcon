"""
ASGI entrypoint for Falcon PMS (HTTP + WebSockets).
Production: daphne / uvicorn → config.asgi:application
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from config.routing import application  # noqa: E402

__all__ = ['application']
