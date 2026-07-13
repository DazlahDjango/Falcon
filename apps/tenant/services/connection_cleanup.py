import logging
import threading
import time
from django.conf import settings
from django.utils import timezone
from apps.tenant.services import ConnectionService

logger = logging.getLogger(__name__)


class ConnectionCleanupScheduler:
    def __init__(self):
        self.running = False
        self.thread = None
        self.interval = getattr(settings, 'CONNECTION_CLEANUP_INTERVAL_SECONDS', 60)
        self.idle_timeout_minutes = getattr(settings, 'CONNECTION_IDLE_TIMEOUT_MINUTES', 30)
        self.prewarm_on_startup = getattr(settings, 'CONNECTION_PREWARM_ON_STARTUP', True)

    def start(self):
        if self.running:
            return
        self.running = True
        
        # 10. Pre-warm connections during startup to reduce initial latency
        if self.prewarm_on_startup:
            try:
                service = ConnectionService()
                warmed = service.prewarm_connections()
                logger.info(f"Pre-warmed {warmed} tenant database connections during scheduler startup.")
            except Exception as e:
                logger.warning(f"Failed to pre-warm connections on startup: {e}")

        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        logger.info(
            f"Connection cleanup scheduler started (interval: {self.interval}s, idle timeout: {self.idle_timeout_minutes}m)"
        )

    def stop(self):
        self.running = False
        
        # 18. Graceful connection draining on shutdown
        try:
            service = ConnectionService()
            drained_timeout = getattr(settings, 'CONNECTION_DRAIN_TIMEOUT_SECONDS', 10)
            drained = service.drain_connections(timeout=drained_timeout)
            logger.info(f"Drained {drained} connections during scheduler shutdown.")
        except Exception as e:
            logger.error(f"Failed to drain connections on stop: {e}")

        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Connection cleanup scheduler stopped")

    def _run(self):
        while self.running:
            try:
                time.sleep(self.interval)
                if self.running:
                    self._cleanup()
            except Exception as e:
                logger.error(f"Connection cleanup run loop failed: {str(e)}")

    def _cleanup(self):
        service = ConnectionService()
        closed = service.close_idle_connections(self.idle_timeout_minutes)
        if closed > 0:
            logger.info(f"Closed {closed} idle connections")
        expired = service.close_expired_connections()
        if expired > 0:
            logger.info(f"Closed {expired} expired connections")
