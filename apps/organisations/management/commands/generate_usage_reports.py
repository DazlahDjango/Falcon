"""
Management command to generate usage reports for all organisations
Run monthly to track usage and send reports
"""

import logging
import csv
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.organisations.models import Organisation
from apps.organisations.services import UsageReporterService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Generate usage reports for all organisations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='usage_report.csv',
            help='Output file path (default: usage_report.csv)'
        )
        parser.add_argument(
            '--send-email',
            action='store_true',
            help='Send reports via email to organisation admins'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to report (default: 30)'
        )

    def handle(self, *args, **options):
        output_file = options['output']
        send_email = options['send_email']
        days = options['days']
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"GENERATING USAGE REPORTS")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"Output: {output_file}")
        self.stdout.write(f"Send Email: {send_email}")
        self.stdout.write(f"Period: Last {days} days")
        self.stdout.write(f"{'='*60}\n")
        
        # Get all active organisations
        organisations = Organisation.objects.filter(is_active=True)
        
        total = organisations.count()
        self.stdout.write(f"Found {total} active organisations\n")
        
        # Prepare report data
        report_data = []
        
        for org in organisations:
            stats = UsageReporterService.get_usage_stats(org)
            stats['organisation_name'] = org.name
            stats['organisation_id'] = str(org.id)
            stats['organisation_slug'] = org.slug
            stats['sector'] = org.sector
            stats['status'] = org.status
            
            report_data.append(stats)
            
            self.stdout.write(f"  📊 {org.name}")
            self.stdout.write(f"     Users: {stats.get('total_users', 0)}")
            self.stdout.write(f"     Departments: {stats.get('total_departments', 0)}")
            self.stdout.write(f"     Teams: {stats.get('total_teams', 0)}")
            self.stdout.write(f"     Positions: {stats.get('total_positions', 0)}")
            self.stdout.write("")
        
        # Write to CSV
        if report_data:
            with open(output_file, 'w', newline='') as csvfile:
                fieldnames = report_data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(report_data)
            
            self.stdout.write(f"✅ Report saved to: {output_file}")
        else:
            self.stdout.write("⚠️ No data to write")
        
        # Send emails if requested
        if send_email:
            self.stdout.write("\n📧 Sending reports via email...")
            # TODO: Implement email sending
            self.stdout.write("   ⏳ Email sending not yet implemented")
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"✅ COMPLETED")
        self.stdout.write(f"{'='*60}\n")