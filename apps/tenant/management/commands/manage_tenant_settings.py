"""
Comprehensive Management Command for Falcon PMS Tenant System Settings.
Handles:
- Settings Inspection: show, get, export
- Settings Modification: set, update-section, import, reset, seed, clear-cache

Usage:
    python manage.py manage_tenant_settings show
    python manage.py manage_tenant_settings show --section security
    python manage.py manage_tenant_settings get --section isolation --key rls_enabled
    python manage.py manage_tenant_settings set --section isolation --key rls_enabled --value true --type bool
    python manage.py manage_tenant_settings update-section --section realtime --json-data '{"websocket_enabled": true}'
    python manage.py manage_tenant_settings seed
    python manage.py manage_tenant_settings reset [--force]
    python manage.py manage_tenant_settings export --output settings.json
    python manage.py manage_tenant_settings import --input settings.json
    python manage.py manage_tenant_settings clear-cache
"""

import sys
import os
import json
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.tenant.models import OrganizationSettings
from apps.tenant.services import OrganizationSettingsService
from apps.tenant.exceptions import OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant system settings, configurations, and cache.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- SHOW ----------------
        show_parser = subparsers.add_parser('show', help='Display current system settings or a specific section')
        show_parser.add_argument('--section', '-s', type=str, help='Settings section name (e.g. general, security, isolation, realtime, provisioning)')
        show_parser.add_argument('--json', action='store_true', help='Output in raw JSON format')

        # ---------------- GET ----------------
        get_parser = subparsers.add_parser('get', help='Get a single setting value')
        get_parser.add_argument('--section', '-s', type=str, required=True, help='Settings section')
        get_parser.add_argument('--key', '-k', type=str, required=True, help='Setting key name')

        # ---------------- SET ----------------
        set_parser = subparsers.add_parser('set', help='Set a single setting value')
        set_parser.add_argument('--section', '-s', type=str, required=True, help='Settings section')
        set_parser.add_argument('--key', '-k', type=str, required=True, help='Setting key name')
        set_parser.add_argument('--value', '-v', type=str, required=True, help='Setting value string')
        set_parser.add_argument('--type', '-t', type=str, default='str', choices=['str', 'int', 'float', 'bool', 'json'], help='Value data type (default: str)')

        # ---------------- UPDATE SECTION ----------------
        sec_parser = subparsers.add_parser('update-section', help='Update an entire section using JSON data')
        sec_parser.add_argument('--section', '-s', type=str, required=True, help='Settings section')
        sec_parser.add_argument('--json-data', '-d', type=str, required=True, help='JSON formatted data patch')

        # ---------------- SEED ----------------
        subparsers.add_parser('seed', help='Ensure default tenant settings are seeded')

        # ---------------- RESET ----------------
        reset_parser = subparsers.add_parser('reset', help='Reset all settings to system defaults')
        reset_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

        # ---------------- EXPORT ----------------
        exp_parser = subparsers.add_parser('export', help='Export settings to a JSON file')
        exp_parser.add_argument('--output', '-o', type=str, required=True, help='Output file path')

        # ---------------- IMPORT ----------------
        imp_parser = subparsers.add_parser('import', help='Import and apply settings from a JSON file')
        imp_parser.add_argument('--input', '-i', type=str, required=True, help='Input file path')

        # ---------------- CLEAR CACHE ----------------
        subparsers.add_parser('clear-cache', help='Clear tenant settings cache from Redis/Django cache')

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
            self.stdout.write(self.style.ERROR(f"Settings Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    # ---------------- HANDLERS ----------------

    def handle_show(self, options):
        section = options.get('section')
        as_json = options.get('json', False)

        settings = OrganizationSettingsService.get_settings(use_cache=False)

        if section:
            data = settings.get(section)
            if data is None:
                raise CommandError(f"Section '{section}' not found in settings. Available sections: {list(settings.keys())}")
            title = f"TENANT SETTINGS: SECTION [{section.upper()}]"
        else:
            data = settings
            title = "FALCON TENANT SYSTEM SETTINGS"

        if as_json:
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS(f" {title}"))
        self.stdout.write("=" * 70)
        self.stdout.write(json.dumps(data, indent=2))
        self.stdout.write("=" * 70 + "\n")

    def handle_get(self, options):
        section = options['section']
        key = options['key']
        val = OrganizationSettingsService.get_value(section, key)
        if val is None:
            self.stdout.write(self.style.WARNING(f"Setting '{section}.{key}' is not set (None)."))
        else:
            self.stdout.write(self.style.SUCCESS(f"{section}.{key} = {json.dumps(val)}"))

    def handle_set(self, options):
        section = options['section']
        key = options['key']
        raw_val = options['value']
        vtype = options.get('type', 'str')

        # Parse type
        if vtype == 'int':
            parsed_val = int(raw_val)
        elif vtype == 'float':
            parsed_val = float(raw_val)
        elif vtype == 'bool':
            parsed_val = raw_val.lower() in ('true', '1', 'yes', 't')
        elif vtype == 'json':
            try:
                parsed_val = json.loads(raw_val)
            except json.JSONDecodeError as e:
                raise CommandError(f"Invalid JSON string: {e}")
        else:
            parsed_val = raw_val

        patch = {section: {key: parsed_val}}
        OrganizationSettingsService.update_settings(patch)
        self.stdout.write(self.style.SUCCESS(f"Updated setting: {section}.{key} = {json.dumps(parsed_val)}"))

    def handle_update_section(self, options):
        section = options['section']
        json_data_str = options['json_data']

        try:
            patch_data = json.loads(json_data_str)
            if not isinstance(patch_data, dict):
                raise CommandError("JSON patch data must be a valid JSON object/dictionary.")
        except json.JSONDecodeError as e:
            raise CommandError(f"Invalid JSON in --json-data: {e}")

        OrganizationSettingsService.update_section(section, patch_data)
        self.stdout.write(self.style.SUCCESS(f"Successfully updated section [{section}]."))

    def handle_seed(self, options):
        OrganizationSettingsService.get_record()
        self.stdout.write(self.style.SUCCESS("Organization settings record seeded/verified successfully."))

    def handle_reset(self, options):
        force = options.get('force', False)
        if not force:
            confirm = input("Are you sure you want to reset ALL tenant settings to system defaults? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        OrganizationSettingsService.reset_to_defaults()
        self.stdout.write(self.style.SUCCESS("All tenant system settings have been reset to factory defaults."))

    def handle_export(self, options):
        output_file = options['output']
        settings = OrganizationSettingsService.get_settings(use_cache=False)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2)
        self.stdout.write(self.style.SUCCESS(f"Exported settings to '{output_file}'."))

    def handle_import(self, options):
        input_file = options['input']
        if not os.path.exists(input_file):
            raise CommandError(f"File not found: '{input_file}'")

        with open(input_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, dict):
                    raise CommandError("Imported file must contain a JSON dictionary.")
            except json.JSONDecodeError as e:
                raise CommandError(f"Invalid JSON in '{input_file}': {e}")

        OrganizationSettingsService.update_settings(data)
        self.stdout.write(self.style.SUCCESS(f"Imported settings from '{input_file}' successfully."))

    def handle_clear_cache(self, options):
        OrganizationSettingsService.clear_cache()
        self.stdout.write(self.style.SUCCESS("Tenant settings cache cleared."))
