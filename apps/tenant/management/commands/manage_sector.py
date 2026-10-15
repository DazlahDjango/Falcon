"""
Comprehensive Management Command for Falcon PMS Organization Industry Sectors.
Handles:
- Sector Lifecycle: list, info, create, update, delete
- Seeding & Organization Assignment: seed, assign

Usage:
    python manage.py manage_sector list
    python manage.py manage_sector info --code CORP
    python manage.py manage_sector create --code TECH --name Technology --type COMMERCIAL --color "#3B82F6"
    python manage.py manage_sector update --code TECH --name "Tech & Software"
    python manage.py manage_sector delete --code TECH [--hard]
    python manage.py manage_sector seed
    python manage.py manage_sector assign --org-id <uuid> --code CORP
"""

import sys
import json
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Count, Q

from apps.tenant.models import Organization, OrganizationSector
from apps.tenant.services import DataSeederService
from apps.tenant.exceptions import OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Organization Industry Sectors.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List industry sectors with filters')
        list_parser.add_argument('--type', '-t', type=str, help='Filter by sector type (COMMERCIAL, NGO, PUBLIC, CONSULTING, HEALTHCARE, EDUCATION, OTHER)')
        list_parser.add_argument('--active', type=str, choices=['true', 'false'], help='Filter by active status')
        list_parser.add_argument('--search', '-q', type=str, help='Search query (code, name, description)')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Max rows to show (default: 50)')
        list_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display details of a single sector')
        info_parser.add_argument('--code', '-c', type=str, help='Sector Code')
        info_parser.add_argument('--sector-id', '-i', type=str, help='Sector UUID')
        info_parser.add_argument('--json', action='store_true', help='Output details as JSON')

        # ---------------- CREATE ----------------
        create_parser = subparsers.add_parser('create', help='Create a new industry sector')
        create_parser.add_argument('--code', '-c', type=str, required=True, help='Unique sector code (e.g. CORP, TECH, FIN)')
        create_parser.add_argument('--name', '-n', type=str, required=True, help='Sector display name')
        create_parser.add_argument('--type', '-t', type=str, default='COMMERCIAL', choices=['COMMERCIAL', 'NGO', 'PUBLIC', 'CONSULTING', 'HEALTHCARE', 'EDUCATION', 'OTHER'], help='Sector type')
        create_parser.add_argument('--description', '-d', type=str, default='', help='Sector description')
        create_parser.add_argument('--color', type=str, default='#2563EB', help='Brand color hex code (default: #2563EB)')
        create_parser.add_argument('--icon', type=str, default='FiBriefcase', help='Feather icon name')

        # ---------------- UPDATE ----------------
        update_parser = subparsers.add_parser('update', help='Update an existing sector')
        update_parser.add_argument('--code', '-c', type=str, help='Sector Code to identify')
        update_parser.add_argument('--sector-id', '-i', type=str, help='Sector UUID to identify')
        update_parser.add_argument('--name', '-n', type=str, help='New display name')
        update_parser.add_argument('--type', '-t', type=str, choices=['COMMERCIAL', 'NGO', 'PUBLIC', 'CONSULTING', 'HEALTHCARE', 'EDUCATION', 'OTHER'], help='New sector type')
        update_parser.add_argument('--description', '-d', type=str, help='New description')
        update_parser.add_argument('--color', type=str, help='New brand color hex')
        update_parser.add_argument('--icon', type=str, help='New icon name')
        update_parser.add_argument('--active', type=str, choices=['true', 'false'], help='Enable/disable sector')

        # ---------------- DELETE ----------------
        del_parser = subparsers.add_parser('delete', help='Delete a sector')
        del_parser.add_argument('--code', '-c', type=str, help='Sector Code')
        del_parser.add_argument('--sector-id', '-i', type=str, help='Sector UUID')
        del_parser.add_argument('--hard', action='store_true', help='Perform hard deletion')
        del_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

        # ---------------- SEED ----------------
        subparsers.add_parser('seed', help='Seed standard system industry sectors')

        # ---------------- ASSIGN ----------------
        assign_parser = subparsers.add_parser('assign', help='Assign a sector to an organization')
        assign_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        assign_parser.add_argument('--code', '-c', type=str, required=True, help='Sector code')

    def handle(self, *args, **options):
        action = options['action']
        handler = getattr(self, f"handle_{action.replace('-', '_')}", None)
        if not handler:
            self.stdout.write(self.style.ERROR(f"Action '{action}' is not implemented."))
            return
        try:
            handler(options)
        except CommandError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        except OrganizationException as e:
            self.stdout.write(self.style.ERROR(f"Sector Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    def _resolve_sector(self, options) -> OrganizationSector:
        code = options.get('code')
        sector_id = options.get('sector_id')

        qs = OrganizationSector.objects.all_with_deleted()
        if code:
            sector = qs.filter(code__iexact=code).first()
            if not sector:
                raise CommandError(f"Sector with code '{code}' not found.")
            return sector
        elif sector_id:
            try:
                return qs.get(id=sector_id)
            except OrganizationSector.DoesNotExist:
                raise CommandError(f"Sector with ID '{sector_id}' not found.")
        else:
            raise CommandError("Please specify --code or --sector-id.")

    # ---------------- HANDLERS ----------------

    def handle_list(self, options):
        type_filter = options.get('type')
        active_filter = options.get('active')
        search_query = options.get('search')
        limit = options.get('limit', 50)
        as_json = options.get('json', False)

        qs = OrganizationSector.objects.filter(is_deleted=False).annotate(org_count=Count('organizations')).order_by('name')

        if type_filter:
            qs = qs.filter(sector_type=type_filter.upper())
        if active_filter is not None:
            qs = qs.filter(is_active=(active_filter.lower() == 'true'))
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(code__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        total_count = qs.count()
        sectors = list(qs[:limit])

        if as_json:
            data = [
                {
                    'id': str(s.id),
                    'code': s.code,
                    'name': s.name,
                    'sector_type': s.sector_type,
                    'description': s.description,
                    'color': s.color,
                    'icon': s.icon,
                    'is_active': s.is_active,
                    'organization_count': s.org_count,
                    'created_at': s.created_at.isoformat() if s.created_at else None,
                }
                for s in sectors
            ]
            self.stdout.write(json.dumps({'total': total_count, 'results': data}, indent=2))
            return

        self.stdout.write("\n" + "=" * 90)
        self.stdout.write(self.style.SUCCESS(f" INDUSTRY SECTORS ({len(sectors)} of {total_count} total)"))
        self.stdout.write("=" * 90)
        header = f"{'Code':<10} {'Name':<28} {'Sector Type':<16} {'Active':<8} {'Color':<10} {'Orgs'}"
        self.stdout.write(header)
        self.stdout.write("-" * 90)

        for s in sectors:
            active_str = self.style.SUCCESS("Yes") if s.is_active else self.style.WARNING("No")
            self.stdout.write(
                f"{s.code:<10} {s.name[:26]:<28} {s.sector_type:<16} {active_str:<16} {s.color:<10} {s.org_count}"
            )

        self.stdout.write("-" * 90 + "\n")

    def handle_info(self, options):
        sector = self._resolve_sector(options)
        as_json = options.get('json', False)
        orgs = list(Organization.objects.filter(sector=sector, is_deleted=False))

        if as_json:
            data = {
                'id': str(sector.id),
                'code': sector.code,
                'name': sector.name,
                'sector_type': sector.sector_type,
                'description': sector.description,
                'color': sector.color,
                'icon': sector.icon,
                'is_active': sector.is_active,
                'organizations': [{'id': str(o.id), 'name': o.name, 'slug': o.slug} for o in orgs],
                'created_at': sector.created_at.isoformat() if sector.created_at else None,
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS(f" SECTOR DETAILS: {sector.name} ({sector.code})"))
        self.stdout.write("=" * 65)
        self.stdout.write(f"  Sector ID:     {sector.id}")
        self.stdout.write(f"  Code:          {sector.code}")
        self.stdout.write(f"  Name:          {sector.name}")
        self.stdout.write(f"  Type:          {sector.sector_type}")
        self.stdout.write(f"  Color:         {sector.color}")
        self.stdout.write(f"  Icon:          {sector.icon}")
        self.stdout.write(f"  Active:        {sector.is_active}")
        self.stdout.write(f"  Description:   {sector.description or 'N/A'}")
        self.stdout.write(f"  Organizations: {len(orgs)}")
        for o in orgs[:10]:
            self.stdout.write(f"    - {o.name} ({o.slug})")
        if len(orgs) > 10:
            self.stdout.write(f"    ... and {len(orgs) - 10} more")
        self.stdout.write("=" * 65 + "\n")

    def handle_create(self, options):
        code = options['code'].upper()
        name = options['name']
        stype = options.get('type', 'COMMERCIAL').upper()
        description = options.get('description', '')
        color = options.get('color', '#2563EB')
        icon = options.get('icon', 'FiBriefcase')

        service = DataSeederService()
        data = {
            'code': code,
            'name': name,
            'sector_type': stype,
            'description': description,
            'color': color,
            'icon': icon,
            'is_active': True,
        }
        self.stdout.write(f"Creating sector '{code}' - '{name}'...")
        try:
            sector = service.create_sector(data)
            self.stdout.write(self.style.SUCCESS(f"Sector created: {sector.code} - {sector.name} (ID: {sector.id})"))
        except Exception as e:
            raise CommandError(f"Failed to create sector: {str(e)}")

    def handle_update(self, options):
        sector = self._resolve_sector(options)
        service = DataSeederService()

        update_data = {}
        for f in ['name', 'type', 'description', 'color', 'icon']:
            if options.get(f):
                if f == 'type':
                    update_data['sector_type'] = options['type'].upper()
                else:
                    update_data[f] = options[f]

        if options.get('active') is not None:
            update_data['is_active'] = (options['active'].lower() == 'true')

        if not update_data:
            self.stdout.write(self.style.WARNING("No update fields provided."))
            return

        updated = service.update_sector(sector.id, update_data)
        self.stdout.write(self.style.SUCCESS(f"Updated sector {updated.code} - {updated.name}."))

    def handle_delete(self, options):
        sector = self._resolve_sector(options)
        hard = options.get('hard', False)
        force = options.get('force', False)

        if not force:
            mode = "HARD" if hard else "SOFT"
            confirm = input(f"Are you sure you want to perform {mode} delete on sector '{sector.code}'? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        service = DataSeederService()
        service.delete_sector(sector.id, hard=hard)
        self.stdout.write(self.style.SUCCESS(f"Deleted sector '{sector.code}'."))

    def handle_seed(self, options):
        service = DataSeederService()
        self.stdout.write("Seeding default industry sectors...")
        seeded = service.seed_sectors()
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded/verified {len(seeded)} industry sectors."))

    def handle_assign(self, options):
        org_id = options['org_id']
        code = options['code'].upper()

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        sector = OrganizationSector.objects.filter(code=code).first()
        if not sector:
            raise CommandError(f"Sector with code '{code}' not found.")

        org.sector = sector
        org.save(update_fields=['sector', 'updated_at'])
        self.stdout.write(self.style.SUCCESS(f"Assigned sector '{sector.name}' ({sector.code}) to organization '{org.name}'."))
