import logging
from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.kpi.models import KPI, MonthlyActual, KPICategory
from apps.kpi.services.kpi import KPICreator
from apps.kpi.services.actual import ActualEntry
from apps.kpi.exceptions import PermissionDenied, KPIValidationError

logger = logging.getLogger(__name__)


class BulkKPICreator:
    def __init__(self):
        self.kpi_creator = KPICreator()

    def create_bulk(self, items: List[Dict[str, Any]], user) -> Dict[str, Any]:
        if not user or not getattr(user, 'tenant_id', None):
            raise PermissionDenied("User must belong to a valid tenant")

        created_items = []
        errors = []

        with transaction.atomic():
            for idx, item in enumerate(items, start=1):
                try:
                    name = str(item.get('name', '')).strip()
                    if not name:
                        errors.append({"row": idx, "error": "Performance Indicator name is required"})
                        continue

                    # Auto-assign owner, tenant, and level from logged in user
                    kpi_data = {
                        "name": name,
                        "description": item.get('description', ''),
                        "kpi_type": item.get('kpi_type', 'PERCENTAGE'),
                        "calculation_logic": item.get('calculation_logic'),
                        "measure_type": item.get('measure_type', 'CUMULATIVE'),
                        "unit": item.get('unit', '%'),
                        "decimal_places": item.get('decimal_places', 2),
                        "baseline": item.get('baseline'),
                        "target_value": item.get('target_value') or item.get('targetValue'),
                        "category_id": item.get('category_id') or item.get('categoryId'),
                        "department_id": item.get('department_id') or getattr(user, 'department_id', None),
                        "owner_id": user.id,
                        "tenant_id": user.tenant_id,
                        "is_staff_created": True
                    }

                    kpi = self.kpi_creator.create(kpi_data, user)
                    created_items.append({
                        "row": idx,
                        "id": str(kpi.id),
                        "name": kpi.name,
                        "kpi_type": kpi.kpi_type,
                        "approval_status": kpi.approval_status,
                        "unit": kpi.unit
                    })
                except Exception as e:
                    logger.error(f"Bulk KPI Creation row {idx} error: {str(e)}", exc_info=True)
                    errors.append({"row": idx, "name": item.get('name', 'Unknown'), "error": str(e)})

            if errors and not created_items:
                # If everything failed, abort transaction
                raise ValidationError(f"Failed to create bulk KPIs: {errors}")

        return {
            "created_count": len(created_items),
            "error_count": len(errors),
            "created_items": created_items,
            "errors": errors
        }


class BulkActualSubmitter:
    def __init__(self):
        self.actual_entry = ActualEntry()

    def submit_bulk(self, items: List[Dict[str, Any]], user, year: int, month: int) -> Dict[str, Any]:
        if not user or not getattr(user, 'tenant_id', None):
            raise PermissionDenied("User must belong to a valid tenant")

        submitted_items = []
        errors = []

        with transaction.atomic():
            for idx, item in enumerate(items, start=1):
                try:
                    kpi_id = item.get('kpi_id') or item.get('kpiId')
                    kpi_name = item.get('kpi_name') or item.get('kpiName')
                    actual_val_raw = item.get('actual_value') if item.get('actual_value') is not None else item.get('actualValue')

                    if not kpi_id and kpi_name:
                        kpi_obj = KPI.objects.filter(
                            tenant_id=user.tenant_id,
                            name__iexact=str(kpi_name).strip()
                        ).first()
                        if kpi_obj:
                            kpi_id = str(kpi_obj.id)

                    if not kpi_id:
                        errors.append({"row": idx, "error": f"Performance Indicator not identified for row {idx}"})
                        continue

                    kpi_obj = KPI.objects.filter(id=kpi_id).first()
                    if not kpi_obj:
                        errors.append({"row": idx, "error": f"Performance Indicator for row {idx} not found."})
                        continue

                    if kpi_obj.approval_status != 'APPROVED':
                        errors.append({"row": idx, "error": f"Performance Indicator '{kpi_obj.name}' is not approved yet (Status: {kpi_obj.approval_status}). Only approved Performance Indicators accept actual entries."})
                        continue

                    if not kpi_obj.is_active:
                        errors.append({"row": idx, "error": f"Performance Indicator '{kpi_obj.name}' is inactive."})
                        continue

                    if not getattr(user, 'is_superuser', False) and kpi_obj.owner_id and str(kpi_obj.owner_id) != str(user.id):
                        errors.append({"row": idx, "error": f"You can only submit actual values for Performance Indicators assigned to or created by you."})
                        continue

                    if actual_val_raw is None or str(actual_val_raw).strip() == '':
                        errors.append({"row": idx, "error": f"Actual value is required for row {idx}"})
                        continue

                    actual_val = Decimal(str(actual_val_raw))
                    notes = item.get('notes', 'Bulk form submission')

                    actual = self.actual_entry.enter_actual(
                        kpi_id=kpi_id,
                        user_id=str(user.id),
                        year=year,
                        month=month,
                        actual_value=actual_val,
                        notes=notes,
                        user=user
                    )

                    submitted_items.append({
                        "row": idx,
                        "id": str(actual.id),
                        "kpi_id": str(actual.kpi_id),
                        "actual_value": str(actual.actual_value),
                        "status": actual.status
                    })
                except Exception as e:
                    logger.error(f"Bulk Actual Submission row {idx} error: {str(e)}", exc_info=True)
                    errors.append({"row": idx, "error": str(e)})

            if errors and not submitted_items:
                raise ValidationError(f"Failed to submit bulk actuals: {errors}")

        return {
            "submitted_count": len(submitted_items),
            "error_count": len(errors),
            "submitted_items": submitted_items,
            "errors": errors
        }


class BulkFormProcessor:
    def __init__(self):
        self.kpi_creator = BulkKPICreator()
        self.actual_submitter = BulkActualSubmitter()

    def process_combined(self, items: List[Dict[str, Any]], user, year: int, month: int) -> Dict[str, Any]:
        results = {
            "kpis_created": 0,
            "actuals_submitted": 0,
            "details": [],
            "errors": []
        }

        with transaction.atomic():
            for idx, item in enumerate(items, start=1):
                try:
                    # Step 1: Create KPI
                    name = str(item.get('name', '')).strip()
                    if not name:
                        results["errors"].append({"row": idx, "error": "Performance Indicator name is required"})
                        continue

                    kpi_data = {
                        "name": name,
                        "description": item.get('description', ''),
                        "kpi_type": item.get('kpi_type', 'PERCENTAGE'),
                        "calculation_logic": item.get('calculation_logic'),
                        "measure_type": item.get('measure_type', 'CUMULATIVE'),
                        "unit": item.get('unit', '%'),
                        "target_value": item.get('target_value') or item.get('targetValue'),
                        "category_id": item.get('category_id') or item.get('categoryId'),
                        "department_id": item.get('department_id') or getattr(user, 'department_id', None),
                        "owner_id": user.id,
                        "tenant_id": user.tenant_id,
                        "is_staff_created": True,
                    }

                    kpi = self.kpi_creator.kpi_creator.create(kpi_data, user)
                    results["kpis_created"] += 1

                    # Step 2: Submit Actual if provided
                    actual_val_raw = item.get('actual_value') if item.get('actual_value') is not None else item.get('actualValue')
                    if actual_val_raw is not None and str(actual_val_raw).strip() != '':
                        actual_val = Decimal(str(actual_val_raw))
                        notes = item.get('notes', 'Initial actual value submission from bulk creation form')
                        
                        actual = self.actual_submitter.actual_entry.enter_actual(
                            kpi_id=str(kpi.id),
                            user_id=str(user.id),
                            year=year,
                            month=month,
                            actual_value=actual_val,
                            notes=notes,
                            user=user
                        )
                        results["actuals_submitted"] += 1

                    results["details"].append({
                        "row": idx,
                        "kpi_id": str(kpi.id),
                        "kpi_name": kpi.name,
                        "approval_status": kpi.approval_status
                    })
                except Exception as e:
                    logger.error(f"Bulk Combined row {idx} error: {str(e)}", exc_info=True)
                    results["errors"].append({"row": idx, "name": item.get('name', 'Unknown'), "error": str(e)})

        return results
