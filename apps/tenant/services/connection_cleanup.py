import logging
import threading
import time
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class ConnectionCleanupScheduler:
    """
    Background thread to periodically clean up idle connections.
    
    Features:
        - Runs in separate thread
        - Closes idle connections every hour
        - Updates connection metrics
        - Handles cleanup errors gracefully
    """
    
    def __init__(self):
        self.thread = None
        self.running = False
        self.cleanup_interval = getattr(settings, 'CONNECTION_CLEANUP_INTERVAL', 3600)  # 1 hour
        self.idle_timeout = getattr(settings, 'CONNECTION_IDLE_TIMEOUT_MINUTES', 30)

    def start(self):
        """Start the cleanup scheduler in a background thread"""
        if self.running:
            logger.warning("Cleanup scheduler already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run_cleanup_loop, daemon=True)
        self.thread.start()
        logger.info("Connection cleanup scheduler started")

    def stop(self):
        """Stop the cleanup scheduler"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Connection cleanup scheduler stopped")

    def _run_cleanup_loop(self):
        """Main cleanup loop running in background thread"""
        while self.running:
            try:
                time.sleep(self.cleanup_interval)
                self._perform_cleanup()
            except Exception as e:
                logger.error(f"Cleanup failed: {str(e)}")

    def _perform_cleanup(self):
        """Perform cleanup operations"""
        try:
            from . import ConnectionManager
            manager = ConnectionManager()
            
            # Close idle connections
            count = manager.close_idle_connections(self.idle_timeout)
            
            if count > 0:
                logger.info(f"Cleaned up {count} idle connections")
            
            # Get metrics
            active_count = manager.get_active_connections_count()
            idle_count = manager.get_idle_connections_count()
            
            logger.debug(f"Connection pool status - Active: {active_count}, Idle: {idle_count}")
            
        except Exception as e:
            logger.error(f"Cleanup operation failed: {str(e)}")