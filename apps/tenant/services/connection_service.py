import uuid
import logging
import threading
import time
import traceback
import random
from contextlib import contextmanager
from datetime import timedelta
from django.db import connections
from django.conf import settings
from django.utils import timezone
from apps.tenant.models import OrganizationConnection
from apps.tenant.exceptions import ConnectionError, ConnectionPoolExhaustedError
from apps.tenant.constants import ConnectionStatus

logger = logging.getLogger(__name__)


class ConnectionService:
    _thread_local = threading.local()
    _connection_locks = {}
    _connection_locks_lock = threading.Lock()

    # 15. Connection Pause/Resume
    _paused_organizations = set()
    _paused_lock = threading.Lock()

    # 18. Connection Drain
    _draining = False
    _draining_lock = threading.Lock()

    # 16. Connection Debugging
    _connection_stack_traces = {}
    _stack_traces_lock = threading.Lock()

    # 7. Connection Metrics & Monitoring
    _metrics_data = {
        'acquisitions': 0,
        'failures': 0,
        'recycles': 0,
        'wait_time_sum': 0.0,
        'wait_time_count': 0,
    }
    _metrics_lock = threading.Lock()

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @property
    def _connections(self):
        if not hasattr(self._thread_local, 'connections'):
            self._thread_local.connections = {}  # key: (organization_id, read_only) -> connection
        return self._thread_local.connections

    @property
    def _timestamps(self):
        if not hasattr(self._thread_local, 'timestamps'):
            self._thread_local.timestamps = {}  # key: (organization_id, read_only) -> connected_at
        return self._thread_local.timestamps

    @property
    def _usage_counts(self):
        if not hasattr(self._thread_local, 'usage_counts'):
            self._thread_local.usage_counts = {}  # key: (organization_id, read_only) -> count
        return self._thread_local.usage_counts

    @classmethod
    def pause_connection(cls, organization_id):
        """Pause connections for a specific organization."""
        with cls._paused_lock:
            cls._paused_organizations.add(str(organization_id))
            logger.info(f"Connection paused for organization {organization_id}")

    @classmethod
    def resume_connection(cls, organization_id):
        """Resume connections for a specific organization."""
        with cls._paused_lock:
            cls._paused_organizations.discard(str(organization_id))
            logger.info(f"Connection resumed for organization {organization_id}")

    @classmethod
    def is_paused(cls, organization_id):
        """Check if connections are paused for an organization."""
        with cls._paused_lock:
            return str(organization_id) in cls._paused_organizations

    def _increment_metric(self, name, amount=1):
        with self._metrics_lock:
            if name in self._metrics_data:
                self._metrics_data[name] += amount

    def _add_wait_time(self, duration):
        with self._metrics_lock:
            self._metrics_data['wait_time_sum'] += duration
            self._metrics_data['wait_time_count'] += 1

    def _get_connection_lock(self, organization_id):
        with self._connection_locks_lock:
            if organization_id not in self._connection_locks:
                self._connection_locks[organization_id] = threading.Lock()
            return self._connection_locks[organization_id]

    @contextmanager
    def _acquire_connection_lock(self, organization_id):
        # 17. Connection Wait Timeout
        lock = self._get_connection_lock(organization_id)
        timeout = getattr(settings, 'CONNECTION_WAIT_TIMEOUT_SECONDS', 5)
        start_time = time.time()
        acquired = lock.acquire(timeout=timeout)
        wait_duration = time.time() - start_time
        self._add_wait_time(wait_duration)

        if not acquired:
            self._increment_metric('failures')
            raise ConnectionPoolExhaustedError(
                f"Timeout waiting for connection slot for organization {organization_id}"
            )
        try:
            yield
        finally:
            lock.release()

    def get_connection(self, organization_id, read_only=False):
        """
        Get connection for organization, verifying its schema and health.
        Supports read/write splitting, proactive timeouts, and stale recycling.
        """
        self.logger.debug(f"Getting connection for organization: {organization_id} (read_only: {read_only})")

        # 18. Check if draining/shutting down
        with self._draining_lock:
            if self.__class__._draining:
                raise ConnectionError("Connection service is draining and shutting down")

        # 15. Check if connection is paused for maintenance
        if self.is_paused(organization_id):
            raise ConnectionError(f"Connection for organization {organization_id} is currently paused for maintenance")

        key = (str(organization_id), read_only)

        with self._acquire_connection_lock(organization_id):
            self._increment_metric('acquisitions')
            self._cleanup_stale_connections()

            if key in self._connections:
                conn = self._connections[key]

                # 4. Connection Timeout Management (Proactive check)
                lifetime_minutes = getattr(settings, 'CONNECTION_MAX_LIFETIME_MINUTES', 120)
                is_expired = False
                if lifetime_minutes > 0 and key in self._timestamps:
                    if timezone.now() - self._timestamps[key] > timedelta(minutes=lifetime_minutes):
                        is_expired = True

                # 9. Stale Connection Recycling
                max_uses = getattr(settings, 'CONNECTION_MAX_USES', 1000)
                usage_count = self._usage_counts.get(key, 0)
                is_stale = usage_count >= max_uses

                # 2. Connection Health Check
                is_healthy = self._is_alive(conn)

                if is_healthy and not is_expired and not is_stale:
                    self._usage_counts[key] = usage_count + 1
                    self._update_timestamp(organization_id, read_only)
                    # 13. Ensure tenant isolation (search path is correct)
                    self._ensure_schema_path(organization_id, conn)
                    return conn

                # Recycle or cleanup connection if unhealthy, expired, or stale
                self.logger.info(
                    f"Recycling connection for organization {organization_id} "
                    f"(healthy: {is_healthy}, expired: {is_expired}, stale: {is_stale})"
                )
                self._remove_connection(organization_id, read_only)
                self._increment_metric('recycles')

            # 5. Max Connections Limit
            if self._is_pool_exhausted(organization_id):
                self._increment_metric('failures')
                raise ConnectionPoolExhaustedError(
                    f"Maximum allowed connections reached for organization {organization_id}"
                )

            return self._create_connection(organization_id, read_only)

    def _ensure_schema_path(self, organization_id, connection):
        """Ensures pg search_path is set to the correct tenant schema."""
        try:
            from apps.tenant.models import Organization
            org = Organization.objects.get(id=organization_id)
            schema = self._get_schema_name(org)
            if schema:
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{schema}", public')
        except Exception as e:
            self.logger.warning(f"Failed to verify/set search path for tenant {organization_id}: {e}")

    def _create_connection(self, organization_id, read_only=False):
        self.logger.info(f"Creating connection for organization: {organization_id} (read_only: {read_only})")
        key = (str(organization_id), read_only)
        try:
            from apps.tenant.models import Organization
            org = Organization.objects.get(id=organization_id)
            
            # 11. Read/Write Splitting & 12. Failover
            db_alias = 'default'
            if read_only:
                if 'replica' in settings.DATABASES:
                    db_alias = 'replica'
                elif 'read_only' in settings.DATABASES:
                    db_alias = 'read_only'

            conn = connections[db_alias]

            try:
                # 6. Retry logic with backoff
                self._connect_with_retries(conn)
            except Exception as e:
                # 12. Failover to replica if primary connection fails
                if db_alias == 'default' and ('replica' in settings.DATABASES or 'read_only' in settings.DATABASES):
                    fallback_alias = 'replica' if 'replica' in settings.DATABASES else 'read_only'
                    self.logger.warning(f"Primary connection failed ({e}). Attempting failover to {fallback_alias}...")
                    conn = connections[fallback_alias]
                    self._connect_with_retries(conn)
                else:
                    raise

            # 14. Connection Encryption Validation
            enforce_ssl = getattr(settings, 'CONNECTION_ENFORCE_SSL', False)
            if enforce_ssl and not self._is_encrypted(conn):
                raise ConnectionError("SSL/TLS connection is required but pg_stat_ssl verification failed.")

            schema = self._get_schema_name(org)
            if schema:
                with conn.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{schema}", public')
            
            self._connections[key] = conn
            self._timestamps[key] = timezone.now()
            self._usage_counts[key] = 1
            
            connection_id = f"conn_{organization_id}_{int(timezone.now().timestamp())}_{uuid.uuid4().hex[:6]}"
            self._record_connection(organization_id, conn, connection_id)
            return conn
        except Exception as e:
            self._increment_metric('failures')
            self.logger.exception("Connection creation failed")
            raise ConnectionError(f"Failed to create connection: {str(e)}")

    def _get_schema_name(self, organization):
        if hasattr(organization, 'schema') and organization.schema:
            return organization.schema.schema_name
        return None

    def _connect_with_retries(self, connection):
        # 6. Connection Retry Logic (with backoff & jitter)
        retries = getattr(settings, 'CONNECTION_RETRY_COUNT', 3)
        backoff = getattr(settings, 'CONNECTION_RETRY_BACKOFF_BASE_SECONDS', 0.2)
        last_exception = None
        for attempt in range(1, retries + 1):
            try:
                connection.ensure_connection()
                return
            except Exception as exc:
                last_exception = exc
                if attempt == retries:
                    break
                # Exponential backoff with jitter
                delay = backoff * (2 ** (attempt - 1))
                delay = delay * random.uniform(0.8, 1.2)
                self.logger.warning(
                    f"Connection attempt {attempt} failed, retrying in {delay:.2f}s: {exc}"
                )
                time.sleep(delay)
        raise last_exception

    def _is_alive(self, connection):
        # 2. Connection Health Checks
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return True
        except Exception:
            return False

    def _is_encrypted(self, connection):
        # 14. Connection Encryption Check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT count(*) FROM pg_stat_ssl WHERE pid = pg_backend_pid() AND ssl = true")
                row = cursor.fetchone()
                return row[0] > 0 if row else False
        except Exception:
            return False

    def _update_timestamp(self, organization_id, read_only=False):
        key = (str(organization_id), read_only)
        self._timestamps[key] = timezone.now()

    def _remove_connection(self, organization_id, read_only=False):
        key = (str(organization_id), read_only)
        if key in self._connections:
            conn = self._connections[key]
            # 13. Reset search path to public on release/removal
            try:
                with conn.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"')
            except Exception as e:
                self.logger.debug(f"Failed to reset search path to public on remove: {e}")

            try:
                conn.close()
            except Exception as e:
                self.logger.warning(f"Error closing connection: {e}")
            finally:
                del self._connections[key]
                if key in self._timestamps:
                    del self._timestamps[key]
                if key in self._usage_counts:
                    del self._usage_counts[key]
                
                # Remove debugging stack trace
                conn_prefix = f"conn_{organization_id}_"
                with self._stack_traces_lock:
                    for conn_id in list(self._connection_stack_traces.keys()):
                        if conn_id.startswith(conn_prefix):
                            del self._connection_stack_traces[conn_id]

    def _record_connection(self, organization_id, connection, connection_id):
        # 16. Connection Debugging Stack Trace
        try:
            stack = "".join(traceback.format_stack()[:-1])
            with self._stack_traces_lock:
                self._connection_stack_traces[connection_id] = stack
        except Exception as e:
            self.logger.warning(f"Failed to record stack trace for connection: {e}")

        try:
            OrganizationConnection.objects.create(
                organization_id=organization_id,
                connection_id=connection_id,
                status=ConnectionStatus.ACTIVE,
                database_name=connection.settings_dict.get('NAME', '') if hasattr(connection, 'settings_dict') else '',
                schema_name=connection.settings_dict.get('OPTIONS', {}).get('search_path', '') if hasattr(connection, 'settings_dict') else '',
                connected_at=timezone.now(),
                last_used_at=timezone.now()
            )
        except Exception as e:
            self.logger.warning(f"Failed to record connection: {str(e)}")

    def _get_max_connections(self, organization_id):
        # 5. Max Connections Limit
        try:
            from apps.tenant.models import Organization
            org = Organization.objects.get(id=organization_id)
            if org.metadata and 'max_connections' in org.metadata:
                return int(org.metadata['max_connections'])
        except Exception:
            pass
        return getattr(settings, 'CONNECTION_POOL_MAX_SIZE', 20)

    def _is_pool_exhausted(self, organization_id):
        max_size = self._get_max_connections(organization_id)
        if max_size <= 0:
            return False
        active_count = OrganizationConnection.objects.filter(
            organization_id=organization_id,
            status__in=[ConnectionStatus.ACTIVE, ConnectionStatus.IDLE]
        ).count()
        if active_count >= max_size:
            self.logger.warning(
                f"Organization {organization_id} has {active_count} active/idle connections; max is {max_size}"
            )
            return True
        return False

    def _cleanup_stale_connections(self):
        self.close_idle_connections()
        self.close_expired_connections()

    def release_connection(self, organization_id, read_only=False):
        """Release connection back to the pool, resetting search path to public."""
        self.logger.debug(f"Releasing connection for organization: {organization_id} (read_only: {read_only})")
        key = (str(organization_id), read_only)
        self._update_timestamp(organization_id, read_only)
        
        # 13. Reset search path to public on connection release
        if key in self._connections:
            conn = self._connections[key]
            try:
                with conn.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"')
            except Exception as e:
                self.logger.warning(f"Failed to reset search path to public on release: {e}")

        # ✅ FIX: Only mark the MOST RECENT ACTIVE record as IDLE, not ALL active
        # records for the organization. The old behaviour marked every ACTIVE record
        # for the org as IDLE on each release, which accumulated 20+ IDLE records
        # across concurrent requests and permanently exhausted the connection pool.
        try:
            latest = OrganizationConnection.objects.filter(
                organization_id=organization_id,
                status=ConnectionStatus.ACTIVE
            ).order_by('-created_at').first()
            if latest:
                latest.status = ConnectionStatus.IDLE
                latest.last_used_at = timezone.now()
                latest.save(update_fields=['status', 'last_used_at'])
        except Exception as e:
            self.logger.warning(f"Failed to update connection status: {str(e)}")

    def close_connection(self, organization_id, read_only=False):
        """Close connection for organization and mark as CLOSED."""
        self.logger.info(f"Closing connection for organization: {organization_id} (read_only: {read_only})")
        self._remove_connection(organization_id, read_only)
        try:
            latest = OrganizationConnection.objects.filter(organization_id=organization_id).order_by('-created_at').first()
            if latest:
                latest.status = ConnectionStatus.CLOSED
                latest.closed_at = timezone.now()
                latest.save(update_fields=['status', 'closed_at'])
        except Exception as e:
            self.logger.warning(f"Failed to update closed status: {str(e)}")

    def close_idle_connections(self, idle_minutes=None):
        idle_minutes = idle_minutes if idle_minutes is not None else getattr(settings, 'CONNECTION_IDLE_TIMEOUT_MINUTES', 30)
        cutoff = timezone.now() - timedelta(minutes=idle_minutes)
        stale_records = OrganizationConnection.objects.filter(
            status=ConnectionStatus.IDLE,
            last_used_at__lt=cutoff
        )
        closed = stale_records.update(
            status=ConnectionStatus.CLOSED,
            closed_at=timezone.now()
        )
        for (org_id, r_only), last_used in list(self._timestamps.items()):
            if last_used < cutoff:
                self._remove_connection(org_id, r_only)
        return closed

    def close_expired_connections(self):
        lifetime_minutes = getattr(settings, 'CONNECTION_MAX_LIFETIME_MINUTES', 120)
        if lifetime_minutes <= 0:
            return 0
        cutoff = timezone.now() - timedelta(minutes=lifetime_minutes)
        expired = OrganizationConnection.objects.filter(
            status__in=[ConnectionStatus.ACTIVE, ConnectionStatus.IDLE],
            connected_at__lt=cutoff
        )
        count = expired.update(
            status=ConnectionStatus.CLOSED,
            closed_at=timezone.now()
        )
        for (org_id, r_only) in list(self._timestamps.keys()):
            if self._timestamps.get((org_id, r_only)) and self._timestamps[(org_id, r_only)] < cutoff:
                self._remove_connection(org_id, r_only)
        return count

    def get_status(self, organization_id, read_only=False):
        key = (str(organization_id), read_only)
        is_connected = key in self._connections
        last_used = self._timestamps.get(key)
        return {
            'organization_id': str(organization_id),
            'read_only': read_only,
            'is_connected': is_connected,
            'last_used_at': last_used.isoformat() if last_used else None,
            'idle_minutes': None if not last_used else (timezone.now() - last_used).total_seconds() / 60,
        }

    def get_all_statuses(self):
        return {f"{org_id}_read_{r_only}": self.get_status(org_id, r_only) for (org_id, r_only) in self._connections.keys()}

    def get_connection_metrics(self, organization_id=None):
        queryset = OrganizationConnection.objects.filter()
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        now = timezone.now()
        total = queryset.count()
        active = queryset.filter(status=ConnectionStatus.ACTIVE).count()
        idle = queryset.filter(status=ConnectionStatus.IDLE).count()
        error = queryset.filter(status=ConnectionStatus.ERROR).count()
        closed = queryset.filter(status=ConnectionStatus.CLOSED).count()
        last_hour = queryset.filter(created_at__gte=now - timedelta(hours=1)).count()
        last_24h = queryset.filter(created_at__gte=now - timedelta(hours=24)).count()
        duration_sum = 0.0
        duration_count = 0
        for record in queryset.exclude(connected_at__isnull=True):
            end_time = record.closed_at or now
            duration_sum += (end_time - record.connected_at).total_seconds()
            duration_count += 1
        avg_duration = duration_sum / duration_count if duration_count else None

        # Merging with local class metrics
        with self._metrics_lock:
            local_acq = self._metrics_data['acquisitions']
            local_fail = self._metrics_data['failures']
            local_recycles = self._metrics_data['recycles']
            wait_sum = self._metrics_data['wait_time_sum']
            wait_count = self._metrics_data['wait_time_count']
            avg_wait = (wait_sum / wait_count) if wait_count > 0 else 0.0

        return {
            'total_connections': total,
            'active_connections': active,
            'idle_connections': idle,
            'error_connections': error,
            'closed_connections': closed,
            'avg_connection_duration_seconds': avg_duration,
            'connections_last_hour': last_hour,
            'connections_last_24h': last_24h,
            'local_acquisitions': local_acq,
            'local_failures': local_fail,
            'local_recycles': local_recycles,
            'avg_lock_wait_time_seconds': avg_wait,
        }

    # 16. Connection Debugging
    def get_debug_traces(self):
        """Returns stack traces of currently active connections."""
        with self._stack_traces_lock:
            return dict(self._connection_stack_traces)

    # 10. Connection Pool Warming
    def prewarm_connections(self, organization_ids=None):
        """Pre-warm connections during startup to reduce initial request latency."""
        self.logger.info("Pre-warming connection pool...")
        if not organization_ids:
            try:
                from apps.tenant.models import Organization
                limit = getattr(settings, 'CONNECTION_POOL_MIN_SIZE', 2)
                organization_ids = list(
                    Organization.objects.filter(status='ACTIVE')[:limit].values_list('id', flat=True)
                )
            except Exception as e:
                self.logger.warning(f"Could not load organizations for warming: {e}")
                organization_ids = []

        warmed_count = 0
        for org_id in organization_ids:
            try:
                self.get_connection(str(org_id))
                warmed_count += 1
            except Exception as e:
                self.logger.warning(f"Failed to pre-warm connection for organization {org_id}: {e}")
        return warmed_count

    # 18. Connection Drain
    def drain_connections(self, timeout=10):
        """Gracefully drain connections during shutdown."""
        self.logger.info("Draining connection pool...")
        with self._draining_lock:
            self.__class__._draining = True

        # Close all active local connections immediately
        closed = self.close_all()
        
        # Mark all database records as closed
        try:
            OrganizationConnection.objects.filter(
                status__in=[ConnectionStatus.ACTIVE, ConnectionStatus.IDLE]
            ).update(
                status=ConnectionStatus.CLOSED,
                closed_at=timezone.now()
            )
        except Exception as e:
            self.logger.warning(f"Failed to update database status during drain: {e}")

        self.logger.info(f"Connection pool draining complete. Closed {closed} local connections.")
        return closed

    def close_all(self):
        count = len(self._connections)
        for (org_id, r_only) in list(self._connections.keys()):
            self.close_connection(org_id, r_only)
        return count
