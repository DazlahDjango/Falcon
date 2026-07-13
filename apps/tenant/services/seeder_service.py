# apps/tenant/services/seeder_service.py
import logging
from django.db import transaction, connection
from django.apps import apps
from apps.tenant.models import OrganizationSector

logger = logging.getLogger(__name__)

class DataSeederService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def seed_default_data(self, organization):
        self.logger.info(f"Seeding default data for {organization.name}")
        schema_name = organization.schema_name
        
        # Check if schema exists in Postgres
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema_name])
            if not cursor.fetchone()[0]:
                self.logger.error(f"Cannot seed data: Schema {schema_name} does not exist")
                return False

        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema_name}", public')
            
        try:
            # 1. Seed Roles
            try:
                Role = apps.get_model('accounts', 'Role')
                default_roles = [
                    {'name': 'Super Admin', 'code': Role.ROLE_SUPER_ADMIN, 'description': 'Full administrative control over all tenant operations.', 'order': 1},
                    {'name': 'Client Admin', 'code': Role.ROLE_CLIENT_ADMIN, 'description': 'Tenant-level administrative access.', 'order': 2},
                    {'name': 'Dashboard Champion', 'code': Role.ROLE_DASHBOARD_CHAMPION, 'description': 'Responsible for managing metrics and KPI dashboards.', 'order': 3},
                    {'name': 'Executive', 'code': Role.ROLE_EXECUTIVE, 'description': 'High-level reporting and view-only analytics access.', 'order': 4},
                    {'name': 'Supervisor', 'code': Role.ROLE_SUPERVISOR, 'description': 'Manages teams, assigns tasks, and reviews progress.', 'order': 5},
                    {'name': 'Staff', 'code': Role.ROLE_STAFF, 'description': 'Performs tasks, inputs KPI actuals, and updates personal dashboard.', 'order': 6},
                    {'name': 'Read Only', 'code': Role.ROLE_READ_ONLY, 'description': 'General view-only access.', 'order': 7},
                ]
                for role_data in default_roles:
                    Role.objects.get_or_create(
                        code=role_data['code'],
                        defaults={
                            'name': role_data['name'],
                            'description': role_data['description'],
                            'role_type': Role.ROLE_TYPE_SYSTEM,
                            'is_system': True,
                            'is_assignable': True,
                            'tenant_id': organization.id,
                            'order': role_data['order']
                        }
                    )
            except LookupError:
                self.logger.warning("Role model not found - skipping role seeding")
            except Exception as e:
                self.logger.error(f"Failed to seed roles: {str(e)}")
                raise

            # 2. Seed Rating Scales
            try:
                RatingScale = apps.get_model('reviews', 'RatingScale')
                levels_data = [
                    {"value": 1, "label": "Needs Improvement", "color": "#ef4444", "min_pct": 0},
                    {"value": 2, "label": "Below Expectations", "color": "#f59e0b", "min_pct": 25},
                    {"value": 3, "label": "Meets Expectations", "color": "#3b82f6", "min_pct": 50},
                    {"value": 4, "label": "Exceeds Expectations", "color": "#10b981", "min_pct": 75},
                    {"value": 5, "label": "Outstanding", "color": "#8b5cf6", "min_pct": 90}
                ]
                RatingScale.objects.get_or_create(
                    name="Standard Scale (1-5)",
                    tenant=organization,
                    defaults={
                        'description': "Default 1 to 5 rating scale",
                        'levels': levels_data,
                        'min_value': 1.00,
                        'max_value': 5.00,
                        'allow_decimal': True,
                        'reverse_scoring': False,
                        'is_active': True,
                        'is_default': True
                    }
                )
            except LookupError:
                self.logger.warning("RatingScale model not found - skipping rating scale seeding")
            except Exception as e:
                self.logger.error(f"Failed to seed rating scales: {str(e)}")
                raise
                
            self.logger.info(f"Seeding completed for tenant: {organization.name}")
            return True
        finally:
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')


    def seed_sectors(self):
        sectors = [
            {'name': 'Corporate', 'code': 'CORP', 'sector_type': 'COMMERCIAL', 'description': 'Commercial and corporate organizations', 'color': '#2563EB', 'icon': 'FiBriefcase'},
            {'name': 'Non-Profit', 'code': 'NGO', 'sector_type': 'NGO', 'description': 'Non-profit and charitable organizations', 'color': '#16A34A', 'icon': 'FiHeart'},
            {'name': 'Government', 'code': 'GOV', 'sector_type': 'PUBLIC', 'description': 'Public sector and government entities', 'color': '#9333EA', 'icon': 'FiGlobe'},
            {'name': 'Consulting', 'code': 'CONS', 'sector_type': 'CONSULTING', 'description': 'Consulting and professional services', 'color': '#F59E0B', 'icon': 'FiTrendingUp'},
        ]
        created = []
        for data in sectors:
            sector, created_bool = OrganizationSector.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            if created_bool:
                created.append(sector)
        self.logger.info(f"Seeded {len(created)} sectors")
        return created

    def create_sector(self, data, user=None):
        with transaction.atomic():
            sector = OrganizationSector.objects.create(
                **data,
                created_by=user
            )
            self.logger.info(f"Created sector: {sector.code} - {sector.name}")
            return sector

    def update_sector(self, sector_id, data, user=None):
        with transaction.atomic():
            sector = OrganizationSector.objects.get(id=sector_id)
            for field in ['name', 'code', 'sector_type', 'description', 'icon', 'color', 'is_active', 'metadata']:
                if field in data:
                    setattr(sector, field, data[field])
            sector.updated_by = user
            sector.save()
            self.logger.info(f"Updated sector: {sector.code} - {sector.name}")
            return sector

    def delete_sector(self, sector_id, hard=False):
        sector = OrganizationSector.objects.get(id=sector_id)
        if hard:
            sector.hard_delete()
            self.logger.warning(f"Hard deleted sector: {sector.code}")
        else:
            sector.soft_delete()
            self.logger.info(f"Soft deleted sector: {sector.code}")
        return True

    def get_sector(self, sector_id):
        return OrganizationSector.objects.get(id=sector_id)

    def get_sector_by_code(self, code):
        return OrganizationSector.objects.get(code=code)

    def list_sectors(self, filters=None):
        qs = OrganizationSector.objects.filter(is_deleted=False)
        if filters:
            if filters.get('sector_type'):
                qs = qs.filter(sector_type=filters['sector_type'])
            if filters.get('is_active') is not None:
                qs = qs.filter(is_active=filters['is_active'])
            if filters.get('search'):
                from django.db.models import Q
                qs = qs.filter(
                    Q(name__icontains=filters['search']) |
                    Q(code__icontains=filters['search']) |
                    Q(description__icontains=filters['search'])
                )
        return qs