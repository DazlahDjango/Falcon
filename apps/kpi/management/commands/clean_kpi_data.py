import sys
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from apps.kpi.models import (
    KPICategory, KPI, KPIHistory, KPIWeight, StrategicLinkage, KPIDependency,
    AnnualTarget, MonthlyPhasing, PhasingLock, TargetHistory,
    MonthlyActual, ActualHistory, ActualAdjustment, Evidence,
    ValidationRecord, ValidationComment, RejectionReason, Escalation,
    Score, AggregatedScore, TrafficLight, Trend, CalculationLog,
    CascadeMap, CascadeRule, CascadeHistory,
    KPISummary, DepartmentRollup, OrganizationHealth, RefreshTracker
)


class Command(BaseCommand):
    help = "Deletes and cleans all KPI data (actuals, scores, targets, cascades, weights, KPIs, categories) for a specific tenant or globally."

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            '-t',
            type=str,
            default=None,
            help='Tenant ID (UUID) to clean data for. If omitted, cleans data for all tenants.'
        )
        parser.add_argument(
            '--keep-categories',
            action='store_true',
            help='Keep KPI Categories and only delete KPIs, Targets, Cascades, Actuals, and Scores.'
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Bypass confirmation prompt.'
        )

    def handle(self, *args, **options):
        tenant_id = options.get('tenant_id')
        keep_categories = options.get('keep_categories', False)
        confirm = options.get('confirm', False)

        if tenant_id:
            from apps.tenant.models import OrganizationSchema
            schema_obj = OrganizationSchema.objects.filter(organization_id=tenant_id).first()
            if schema_obj:
                schema_name = schema_obj.schema_name
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{schema_name}", public')

        scope_msg = f"Tenant ID: {tenant_id}" if tenant_id else "ALL TENANTS (Global Clean)"
        categories_msg = "Preserving Categories" if keep_categories else "Including Categories"

        self.stdout.write(self.style.WARNING(
            f"\n========================================================================\n"
            f"[WARNING] KPI DATA CLEANUP REQUESTED\n"
            f"Scope: {scope_msg}\n"
            f"Mode: {categories_msg}\n"
            f"========================================================================"
        ))

        if not confirm:
            user_input = input("\nAre you SURE you want to delete this KPI data? (type 'yes' to proceed): ")
            if user_input.strip().lower() != 'yes':
                self.stdout.write(self.style.ERROR("Operation cancelled by user."))
                return

        with transaction.atomic():
            self.stdout.write(self.style.NOTICE("\nDeleting performance actuals, evidence, and validation records..."))
            self._delete_model(Evidence, tenant_id)
            self._delete_model(ValidationComment, tenant_id)
            self._delete_model(ValidationRecord, tenant_id)
            self._delete_model(ActualAdjustment, tenant_id)
            self._delete_model(Escalation, tenant_id)
            self._delete_model(ActualHistory, tenant_id)
            self._delete_model(MonthlyActual, tenant_id)

            self.stdout.write(self.style.NOTICE("Deleting targets, phasings, and cascade mappings..."))
            self._delete_model(PhasingLock, tenant_id)
            self._delete_model(MonthlyPhasing, tenant_id)
            self._delete_model(TargetHistory, tenant_id)
            self._delete_model(CascadeHistory, tenant_id)
            self._delete_model(CascadeMap, tenant_id)
            self._delete_model(AnnualTarget, tenant_id)

            self.stdout.write(self.style.NOTICE("Deleting weights, linkages, and dependencies..."))
            self._delete_model(KPIWeight, tenant_id)
            self._delete_model(StrategicLinkage, tenant_id)
            self._delete_model(KPIDependency, tenant_id)

            self.stdout.write(self.style.NOTICE("Deleting scores, trends, and logs..."))
            self._delete_model(TrafficLight, tenant_id)
            self._delete_model(Trend, tenant_id)
            self._delete_model(Score, tenant_id)
            self._delete_model(AggregatedScore, tenant_id)
            self._delete_model(CalculationLog, tenant_id)
            self._delete_model(RefreshTracker, tenant_id)

            self.stdout.write(self.style.NOTICE("Deleting KPI definitions..."))
            self._delete_model(KPIHistory, tenant_id)
            self._delete_model(KPI, tenant_id)

            if not keep_categories:
                self.stdout.write(self.style.NOTICE("Deleting KPI Categories..."))
                self._delete_model(KPICategory, tenant_id)

        self.stdout.write(self.style.SUCCESS(
            "\n[SUCCESS] KPI data cleanup completed successfully! You can now start filling fresh data."
        ))

    def _delete_model(self, model_cls, tenant_id):
        try:
            qs = model_cls.objects.all()
            if tenant_id and hasattr(model_cls, 'tenant_id'):
                qs = qs.filter(tenant_id=tenant_id)
            count, _ = qs.delete()
            self.stdout.write(f"  - Cleared {model_cls.__name__}: {count} records removed.")
        except Exception as e:
            self.stdout.write(f"  - Skipping {model_cls.__name__}: {e}")
