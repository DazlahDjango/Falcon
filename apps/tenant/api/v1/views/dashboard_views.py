from collections import Counter
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.tenant.models import (
    Organization,
    OrganizationConnection,
    OrganizationDomain,
    OrganizationMigration,
    OrganizationResource,
    OrganizationSchema,
)
from apps.tenant.api.v1.permissions import (
    IsSuperAdmin,
    IsOrganizationAdmin,
)

User = get_user_model()

class SuperAdminDashboardViewSet(viewsets.GenericViewSet):
    """
    Super Admin Tenant Dashboard.

    Scope:
        Entire multi-tenant platform.

    This dashboard reads live tenant data directly from the database and
    provides platform-wide tenant statistics.

    Endpoint:
        GET /api/v1/tenant/dashboard/super-admin/
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def list(self, request):
        organizations = Organization.objects.filter(
            is_deleted=False
        )

        # ---------------------------------------------------------
        # ORGANIZATION SUMMARY
        # ---------------------------------------------------------

        organization_summary = {
            "total": organizations.count(),

            "active": organizations.filter(
                is_active=True
            ).count(),

            "inactive": organizations.filter(
                is_active=False
            ).count(),

            "onboarded": organizations.filter(
                is_onboarded=True
            ).count(),

            "not_onboarded": organizations.filter(
                is_onboarded=False
            ).count(),

            "pending": organizations.filter(
                status="PENDING"
            ).count(),

            "provisioning": organizations.filter(
                status="PROVISIONING"
            ).count(),

            "active_status": organizations.filter(
                status="ACTIVE"
            ).count(),

            "suspended": organizations.filter(
                status="SUSPENDED"
            ).count(),

            "failed": organizations.filter(
                status="FAILED"
            ).count(),
        }

        # ---------------------------------------------------------
        # ORGANIZATION STATUS DISTRIBUTION
        # ---------------------------------------------------------

        status_distribution = list(
            organizations
            .values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # ---------------------------------------------------------
        # SECTOR DISTRIBUTION
        # ---------------------------------------------------------

        sector_distribution = list(
            organizations
            .values(
                "sector_id",
                "sector__name",
            )
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # ---------------------------------------------------------
        # SUBSCRIPTION DISTRIBUTION
        # ---------------------------------------------------------

        subscription_distribution = list(
            organizations
            .values("subscription_tier")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # ---------------------------------------------------------
        # PROVISIONING
        # ---------------------------------------------------------

        provisioning = self._get_provisioning_stats(organizations)

        # ---------------------------------------------------------
        # TENANT ISOLATION / SCHEMAS
        # ---------------------------------------------------------

        isolation = self._get_isolation_stats(organizations)

        # ---------------------------------------------------------
        # DOMAINS
        # ---------------------------------------------------------

        domains = self._get_domain_stats()

        # ---------------------------------------------------------
        # CONNECTIONS
        # ---------------------------------------------------------

        connections = self._get_connection_stats()

        # ---------------------------------------------------------
        # RESOURCES
        # ---------------------------------------------------------

        resources = self._get_resource_stats()

        # ---------------------------------------------------------
        # MIGRATIONS
        # ---------------------------------------------------------

        migrations = self._get_migration_stats()

        # ---------------------------------------------------------
        # USERS ACROSS ALL TENANTS
        # ---------------------------------------------------------

        users = self._get_platform_user_stats()

        # ---------------------------------------------------------
        # HEALTH
        # ---------------------------------------------------------

        health = self._get_platform_health(
            organizations=organizations,
            connection_stats=connections,
            isolation_stats=isolation,
        )

        # ---------------------------------------------------------
        # RECENT ORGANIZATIONS
        # ---------------------------------------------------------

        recent_organizations = []

        for organization in organizations.order_by(
            "-created_at"
        )[:10]:

            recent_organizations.append({
                "id": str(organization.id),
                "name": organization.name,
                "slug": organization.slug,
                "status": organization.status,
                "is_active": organization.is_active,
                "is_onboarded": organization.is_onboarded,
                "subscription_tier": organization.subscription_tier,
                "created_at": organization.created_at,
            })

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        return Response({
            "dashboard": "super_admin",
            "scope": "platform",

            "generated_at": timezone.now(),

            "organizations": organization_summary,

            "status_distribution": status_distribution,

            "sector_distribution": sector_distribution,

            "subscription_distribution": subscription_distribution,

            "users": users,

            "provisioning": provisioning,

            "tenant_isolation": isolation,

            "domains": domains,

            "connections": connections,

            "resources": resources,

            "migrations": migrations,

            "health": health,

            "recent_organizations": recent_organizations,
        })

    # =============================================================
    # PROVISIONING
    # =============================================================

    def _get_provisioning_stats(self, organizations):
        """
        Calculate platform-wide provisioning statistics.

        The provisioning API already defines PENDING, PROVISIONING,
        FAILED and completed/active lifecycle states.
        """

        total = organizations.count()

        pending = organizations.filter(
            status="PENDING"
        ).count()

        provisioning = organizations.filter(
            status="PROVISIONING"
        ).count()

        failed = organizations.filter(
            status="FAILED"
        ).count()

        completed = organizations.filter(
            status="ACTIVE",
            is_onboarded=True,
        ).count()

        percentage = 0

        if total:
            percentage = round(
                (completed / total) * 100,
                2,
            )

        return {
            "total": total,
            "pending": pending,
            "in_progress": provisioning,
            "failed": failed,
            "completed": completed,
            "completion_percentage": percentage,
        }

    # =============================================================
    # TENANT ISOLATION
    # =============================================================

    def _get_isolation_stats(self, organizations):
        """
        Calculate tenant schema/isolation statistics.
        """

        organization_ids = organizations.values_list(
            "id",
            flat=True,
        )

        schemas = OrganizationSchema.objects.filter(
            organization_id__in=organization_ids
        )

        total_schemas = schemas.count()

        ready_schemas = schemas.filter(
            is_ready=True
        ).count()

        active_schemas = schemas.filter(
            status="ACTIVE"
        ).count()

        # RLS availability is represented by the schema's
        # protection metadata where available.
        #
        # We do not invent an RLS count if the model does not
        # expose an explicit RLS field.
        #
        # The API exposes enable_rls, so the dashboard reports
        # schema readiness independently.

        return {
            "organizations": len(organization_ids),
            "total_schemas": total_schemas,
            "ready_schemas": ready_schemas,
            "active_schemas": active_schemas,
            "schema_readiness_percentage": (
                round(
                    (ready_schemas / total_schemas) * 100,
                    2,
                )
                if total_schemas
                else 0
            ),
        }

    # =============================================================
    # DOMAINS
    # =============================================================

    def _get_domain_stats(self):
        domains = OrganizationDomain.objects.filter(
            is_deleted=False
        )

        total = domains.count()

        active = domains.filter(
            status="ACTIVE"
        ).count()

        verifying = domains.filter(
            status="VERIFYING"
        ).count()

        primary = domains.filter(
            is_primary=True
        ).count()

        return {
            "total": total,
            "active": active,
            "verifying": verifying,
            "primary": primary,
            "other": max(
                total - active - verifying,
                0,
            ),
        }

    # =============================================================
    # CONNECTIONS
    # =============================================================

    def _get_connection_stats(self):
        connections = OrganizationConnection.objects.filter(
            is_deleted=False
        )

        total = connections.count()

        status_counts = list(
            connections
            .values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        status_map = {
            item["status"]: item["count"]
            for item in status_counts
        }

        # Common statuses used by connection managers.
        connected = (
            status_map.get("CONNECTED", 0)
            + status_map.get("ACTIVE", 0)
        )

        disconnected = (
            status_map.get("DISCONNECTED", 0)
            + status_map.get("CLOSED", 0)
        )

        return {
            "total": total,
            "connected": connected,
            "disconnected": disconnected,
            "status_distribution": status_counts,
        }

    # =============================================================
    # RESOURCES
    # =============================================================

    def _get_resource_stats(self):
        resources = OrganizationResource.objects.all()

        total = resources.count()

        warning = 0
        exceeded = 0

        usage = []

        for resource in resources:

            limit = resource.limit_value or 0
            current = resource.current_value or 0

            percentage = 0

            if limit:
                percentage = round(
                    (float(current) / float(limit)) * 100,
                    2,
                )

            is_exceeded = percentage > 100

            # Resource model exposes is_warning_level as a property
            # in the Tenant API implementation.
            try:
                is_warning = resource.is_warning_level
            except AttributeError:
                is_warning = 80 <= percentage <= 100

            if is_exceeded:
                exceeded += 1

            elif is_warning:
                warning += 1

            usage.append({
                "organization_id": str(
                    resource.organization_id
                ),
                "resource_type": resource.resource_type,
                "resource_display": (
                    resource.get_resource_type_display()
                    if hasattr(
                        resource,
                        "get_resource_type_display"
                    )
                    else resource.resource_type
                ),
                "limit": limit,
                "current": current,
                "percentage": percentage,
                "is_warning": is_warning,
                "is_exceeded": is_exceeded,
            })

        return {
            "total": total,
            "warning": warning,
            "exceeded": exceeded,
            "usage": usage,
        }

    # =============================================================
    # MIGRATIONS
    # =============================================================

    def _get_migration_stats(self):
        migrations = OrganizationMigration.objects.all()

        stats = {
            "total": migrations.count(),
            "pending": migrations.filter(
                status="PENDING"
            ).count(),
            "running": migrations.filter(
                status="RUNNING"
            ).count(),
            "completed": migrations.filter(
                status="COMPLETED"
            ).count(),
            "failed": migrations.filter(
                status="FAILED"
            ).count(),
            "rolled_back": migrations.filter(
                status="ROLLED_BACK"
            ).count(),
        }

        return stats

    # =============================================================
    # USERS
    # =============================================================

    def _get_platform_user_stats(self):
        """
        Users belonging to tenants only.

        Super Admin accounts without tenant_id are not counted
        as tenant users.
        """

        users = User.objects.filter(
            tenant_id__isnull=False
        )

        total = users.count()

        active = users.filter(
            is_active=True
        ).count()

        inactive = users.filter(
            is_active=False
        ).count()

        verified = users.filter(
            is_verified=True
        ).count()

        onboarded = users.filter(
            is_onboarded=True
        ).count()

        role_distribution = list(
            users
            .values("role")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return {
            "total": total,
            "active": active,
            "inactive": inactive,
            "verified": verified,
            "onboarded": onboarded,
            "role_distribution": role_distribution,
        }

    # =============================================================
    # HEALTH
    # =============================================================

    def _get_platform_health(
        self,
        organizations,
        connection_stats,
        isolation_stats,
    ):
        total = organizations.count()

        active = organizations.filter(
            is_active=True
        )

        healthy = 0
        unhealthy = 0

        # Only active organizations participate in
        # tenant connection health.
        for organization in active.iterator():

            has_connection = OrganizationConnection.objects.filter(
                organization_id=organization.id,
                is_deleted=False,
            ).exists()

            if has_connection:
                healthy += 1
            else:
                unhealthy += 1

        if total == 0:
            status_value = "NO_TENANTS"

        elif unhealthy == 0:
            status_value = "HEALTHY"

        elif healthy > 0:
            status_value = "DEGRADED"

        else:
            status_value = "UNHEALTHY"

        return {
            "status": status_value,
            "organizations_checked": active.count(),
            "healthy": healthy,
            "unhealthy": unhealthy,
            "connections": connection_stats,
            "tenant_isolation": isolation_stats,
        }


# =================================================================
# CLIENT ADMIN DASHBOARD
# =================================================================


class ClientAdminDashboardViewSet(viewsets.GenericViewSet):
    """
    Client Admin Tenant Dashboard.

    Scope:
        ONLY the organization/tenant belonging to the authenticated
        Client Admin.

    Endpoint:
        GET /api/v1/tenant/dashboard/client-admin/
    """

    permission_classes = [
        IsAuthenticated,
        IsOrganizationAdmin,
    ]

    def list(self, request):
        """
        Return the current Client Admin's tenant dashboard.

        The tenant is ALWAYS obtained from request.user.tenant_id.

        The client cannot provide an arbitrary organization_id.
        """

        organization_id = getattr(
            request.user,
            "tenant_id",
            None,
        )

        if not organization_id:
            return Response(
                {
                    "error": (
                        "Organization not found for "
                        "authenticated user"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = (
                Organization.objects
                .select_related("sector")
                .get(
                    id=organization_id,
                    is_deleted=False,
                )
            )

        except Organization.DoesNotExist:
            return Response(
                {
                    "error": "Organization not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ---------------------------------------------------------
        # ORGANIZATION
        # ---------------------------------------------------------

        organization_data = {
            "id": str(organization.id),
            "name": organization.name,
            "slug": organization.slug,
            "contact_email": organization.contact_email,
            "status": organization.status,
            "is_active": organization.is_active,
            "is_onboarded": organization.is_onboarded,
            "subscription_tier": organization.subscription_tier,
            "sector": (
                organization.sector.name
                if organization.sector
                else None
            ),
            "created_at": organization.created_at,
        }

        # ---------------------------------------------------------
        # USERS
        # ---------------------------------------------------------

        users = User.objects.filter(
            tenant_id=organization.id
        )

        user_stats = {
            "total": users.count(),

            "active": users.filter(
                is_active=True
            ).count(),

            "inactive": users.filter(
                is_active=False
            ).count(),

            "verified": users.filter(
                is_verified=True
            ).count(),

            "onboarded": users.filter(
                is_onboarded=True
            ).count(),

            "mfa_enabled": users.filter(
                mfa_enabled=True
            ).count(),
        }

        role_distribution = list(
            users
            .values("role")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        user_stats["role_distribution"] = role_distribution

        # ---------------------------------------------------------
        # DOMAINS
        # ---------------------------------------------------------

        domains = OrganizationDomain.objects.filter(
            organization_id=organization.id,
            is_deleted=False,
        )

        domain_data = []

        for domain in domains.order_by(
            "-is_primary",
            "-created_at",
        )[:10]:

            domain_data.append({
                "id": str(domain.id),
                "domain": domain.domain,
                "status": domain.status,
                "is_primary": domain.is_primary,
                "created_at": domain.created_at,

                # This field exists in the Tenant API because
                # renew_ssl returns ssl_expires_at.
                "ssl_expires_at": getattr(
                    domain,
                    "ssl_expires_at",
                    None,
                ),
            })

        domain_stats = {
            "total": domains.count(),

            "active": domains.filter(
                status="ACTIVE"
            ).count(),

            "verifying": domains.filter(
                status="VERIFYING"
            ).count(),

            "primary": domains.filter(
                is_primary=True
            ).count(),

            "items": domain_data,
        }

        # ---------------------------------------------------------
        # RESOURCES
        # ---------------------------------------------------------

        resources = OrganizationResource.objects.filter(
            organization_id=organization.id
        )

        resource_data = []

        warning_count = 0
        exceeded_count = 0

        for resource in resources:

            limit = resource.limit_value or 0
            current = resource.current_value or 0

            percentage = 0

            if limit:
                percentage = round(
                    (float(current) / float(limit)) * 100,
                    2,
                )

            exceeded = percentage > 100

            try:
                warning = resource.is_warning_level
            except AttributeError:
                warning = 80 <= percentage <= 100

            if exceeded:
                exceeded_count += 1
            elif warning:
                warning_count += 1

            resource_data.append({
                "type": resource.resource_type,

                "type_display": (
                    resource.get_resource_type_display()
                    if hasattr(
                        resource,
                        "get_resource_type_display"
                    )
                    else resource.resource_type
                ),

                "limit": limit,
                "current": current,
                "percentage": percentage,
                "is_warning": warning,
                "is_exceeded": exceeded,
            })

        resource_stats = {
            "total": resources.count(),
            "warning": warning_count,
            "exceeded": exceeded_count,
            "resources": resource_data,
        }

        # ---------------------------------------------------------
        # SCHEMA / TENANT ISOLATION
        # ---------------------------------------------------------

        schemas = OrganizationSchema.objects.filter(
            organization_id=organization.id
        )

        schema_data = []

        for schema in schemas:

            schema_data.append({
                "id": str(schema.id),
                "schema_name": schema.schema_name,
                "status": schema.status,
                "is_ready": schema.is_ready,
                "table_count": getattr(
                    schema,
                    "table_count",
                    None,
                ),
                "size_mb": getattr(
                    schema,
                    "size_mb",
                    None,
                ),
            })

        schema_stats = {
            "total": schemas.count(),

            "ready": schemas.filter(
                is_ready=True
            ).count(),

            "active": schemas.filter(
                status="ACTIVE"
            ).count(),

            "schemas": schema_data,
        }

        # ---------------------------------------------------------
        # CONNECTION
        # ---------------------------------------------------------

        connections = OrganizationConnection.objects.filter(
            organization_id=organization.id,
            is_deleted=False,
        )

        connection_data = []

        for connection in connections.order_by(
            "-last_used_at"
        )[:10]:

            connection_data.append({
                "id": str(connection.id),
                "connection_id": connection.connection_id,
                "status": connection.status,
                "created_at": connection.created_at,
                "last_used_at": connection.last_used_at,
            })

        connection_stats = {
            "total": connections.count(),
            "items": connection_data,
        }

        # ---------------------------------------------------------
        # PROVISIONING
        # ---------------------------------------------------------

        provisioning_metadata = {}

        if isinstance(
            getattr(organization, "metadata", None),
            dict,
        ):
            provisioning_metadata = (
                organization.metadata.get(
                    "provisioning",
                    {}
                )
            )

        provisioning = {
            "organization_status": organization.status,

            "is_onboarded": organization.is_onboarded,

            "progress": provisioning_metadata.get(
                "progress",
                100 if organization.is_onboarded else 0,
            ),

            "current_step": provisioning_metadata.get(
                "current_step"
            ),

            "status": provisioning_metadata.get(
                "status",
                organization.status,
            ),

            "started_at": provisioning_metadata.get(
                "started_at"
            ),

            "completed_at": provisioning_metadata.get(
                "completed_at"
            ),

            "error": provisioning_metadata.get(
                "error"
            ),
        }

        # ---------------------------------------------------------
        # MIGRATIONS
        # ---------------------------------------------------------

        migrations = OrganizationMigration.objects.filter(
            organization_id=organization.id
        )

        migration_stats = {
            "total": migrations.count(),

            "pending": migrations.filter(
                status="PENDING"
            ).count(),

            "running": migrations.filter(
                status="RUNNING"
            ).count(),

            "completed": migrations.filter(
                status="COMPLETED"
            ).count(),

            "failed": migrations.filter(
                status="FAILED"
            ).count(),

            "rolled_back": migrations.filter(
                status="ROLLED_BACK"
            ).count(),
        }

        # ---------------------------------------------------------
        # ORGANIZATION HEALTH
        # ---------------------------------------------------------

        health = self._get_organization_health(
            organization=organization,
            connections=connections,
            schemas=schemas,
        )

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        return Response({
            "dashboard": "client_admin",

            "scope": "organization",

            "organization_id": str(
                organization.id
            ),

            "generated_at": timezone.now(),

            "organization": organization_data,

            "users": user_stats,

            "domains": domain_stats,

            "resources": resource_stats,

            "tenant_isolation": schema_stats,

            "connections": connection_stats,

            "provisioning": provisioning,

            "migrations": migration_stats,

            "health": health,
        })

    # =============================================================
    # ORGANIZATION HEALTH
    # =============================================================

    def _get_organization_health(
        self,
        organization,
        connections,
        schemas,
    ):
        """
        Determine health using actual tenant records.

        This intentionally does not claim database connectivity merely
        because a connection record exists.
        """

        has_connection = connections.exists()

        active_connection = connections.filter(
            status__in=[
                "CONNECTED",
                "ACTIVE",
            ]
        ).exists()

        schema_ready = schemas.filter(
            is_ready=True
        ).exists()

        organization_active = organization.is_active

        checks = {
            "organization": {
                "healthy": organization_active,
                "status": (
                    "ACTIVE"
                    if organization_active
                    else "INACTIVE"
                ),
            },

            "connection": {
                "healthy": active_connection,
                "status": (
                    "CONNECTED"
                    if active_connection
                    else (
                        "AVAILABLE"
                        if has_connection
                        else "NO_CONNECTION"
                    )
                ),
            },

            "schema": {
                "healthy": schema_ready,
                "status": (
                    "READY"
                    if schema_ready
                    else "NOT_READY"
                ),
            },
        }

        all_healthy = all(
            check["healthy"]
            for check in checks.values()
        )

        if all_healthy:
            overall_status = "HEALTHY"

        elif any(
            check["healthy"]
            for check in checks.values()
        ):
            overall_status = "DEGRADED"

        else:
            overall_status = "UNHEALTHY"

        return {
            "status": overall_status,
            "checks": checks,
            "checked_at": timezone.now(),
        }