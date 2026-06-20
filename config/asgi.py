"""
ASGI entrypoint for Falcon PMS (HTTP + WebSockets).
Production: daphne / uvicorn → config.asgi:application
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import the application from routing (which handles the ordering correctly)
from config.routing import application

__all__ = ['application']