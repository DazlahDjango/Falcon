import logging
from decimal import Decimal
from typing import Dict, List, Optional, Set
from django.db import transaction
from django.db.models import Sum, Q
from django.core.cache import cache
from django.utils import timezone

from apps.kpi.models import (
    KPI, AnnualTarget, MonthlyPhasing, MonthlyActual,
    CascadeMap, Score, TrafficLight
)
from apps.kpi.engine.traffic_light import TrafficLightEvaluator
from apps.kpi.utils.cache_keys import invalidate_user_dashboards, safe_delete_pattern

logger = logging.getLogger(__name__)

CACHE_PREFIX = "kpi_cascade"


class CascadeRollupService:
    def __init__(self):
        self.traffic_evaluator = TrafficLightEvaluator()

    def rollup_actual(self, actual: MonthlyActual) -> Dict:
        """
        Given an approved MonthlyActual, roll up the approved actual value
        through all parent targets in the CascadeMap tree up to the Organization target.
        """
        if not actual or actual.status != 'APPROVED':
            return {'status': 'SKIPPED', 'reason': 'Actual not approved'}

        tenant_id = actual.tenant_id or getattr(actual.kpi, 'tenant_id', None)
        kpi_id = str(actual.kpi_id)
        user_id = str(actual.user_id)
        year = int(actual.year)
        month = int(actual.month)

        return self.rollup_kpi_cascades(
            tenant_id=str(tenant_id) if tenant_id else None,
            kpi_id=kpi_id,
            year=year,
            month=month,
            trigger_user_id=user_id
        )

    def rollup_kpi_cascades(
        self,
        tenant_id: Optional[str],
        kpi_id: str,
        year: int,
        month: int,
        trigger_user_id: Optional[str] = None
    ) -> Dict:
        """
        Recompute rolled-up scores for all ancestor targets of a cascaded KPI for a given period.
        """
        target_filter = {'kpi_id': kpi_id, 'year': year}
        if tenant_id:
            target_filter['tenant_id'] = tenant_id

        all_targets = list(AnnualTarget.objects.filter(**target_filter).select_related('user', 'kpi'))
        if not all_targets:
            return {'status': 'NO_TARGETS', 'kpi_id': kpi_id}

        target_by_id = {str(t.id): t for t in all_targets}
        target_by_user = {str(t.user_id): t for t in all_targets}

        # Fetch all cascade maps for this KPI/year
        cascade_map_qs = CascadeMap.objects.filter(
            Q(organization_target__kpi_id=kpi_id, organization_target__year=year) |
            Q(parent_target__kpi_id=kpi_id, parent_target__year=year) |
            Q(child_target__kpi_id=kpi_id, child_target__year=year)
        )
        if tenant_id:
            cascade_map_qs = cascade_map_qs.filter(tenant_id=tenant_id)

        cascade_maps = list(cascade_map_qs.select_related(
            'parent_target', 'child_target', 'organization_target',
            'department_target', 'division_target', 'section_target', 'unit_target', 'individual_target'
        ))

        # Build parent-child mapping
        # parent_id -> list of child_target_ids
        parent_to_children: Dict[str, Set[str]] = {}
        child_to_parents: Dict[str, Set[str]] = {}
        all_parent_target_ids: Set[str] = set()

        for cm in cascade_maps:
            parent = cm.parent_target or cm.organization_target
            child = cm.child_target or cm.individual_target or cm.unit_target or cm.section_target or cm.department_target or cm.division_target
            if parent and child:
                pid = str(parent.id)
                cid = str(child.id)
                parent_to_children.setdefault(pid, set()).add(cid)
                child_to_parents.setdefault(cid, set()).add(pid)
                all_parent_target_ids.add(pid)

        # If trigger_user_id is provided, find all ancestor target IDs to update
        targets_to_update: Set[str] = set()
        if trigger_user_id and trigger_user_id in target_by_user:
            trigger_target_id = str(target_by_user[trigger_user_id].id)
            # Walk upward
            queue = [trigger_target_id]
            visited = set()
            while queue:
                curr = queue.pop(0)
                if curr in visited:
                    continue
                visited.add(curr)
                parents = child_to_parents.get(curr, set())
                for p in parents:
                    targets_to_update.add(p)
                    queue.append(p)
        else:
            targets_to_update = all_parent_target_ids

        # Ensure all org targets are included
        for t in all_targets:
            if not child_to_parents.get(str(t.id)) and parent_to_children.get(str(t.id)):
                targets_to_update.add(str(t.id))

        if not targets_to_update:
            targets_to_update = all_parent_target_ids

        # Function to find all descendant leaf user IDs under a target
        def get_descendant_user_ids(parent_tid: str) -> Set[str]:
            desc_users = set()
            queue = [parent_tid]
            visited = set()
            while queue:
                curr_tid = queue.pop(0)
                if curr_tid in visited:
                    continue
                visited.add(curr_tid)
                child_tids = parent_to_children.get(curr_tid, set())
                if not child_tids:
                    # Leaf target
                    target_obj = target_by_id.get(curr_tid)
                    if target_obj and target_obj.user_id:
                        desc_users.add(str(target_obj.user_id))
                else:
                    for c_tid in child_tids:
                        queue.append(c_tid)
            return desc_users

        # Also get all approved monthly actuals for this KPI, year, month
        actuals_filter = {
            'kpi_id': kpi_id,
            'year': year,
            'month': month,
            'status': 'APPROVED'
        }
        if tenant_id:
            actuals_filter['tenant_id'] = tenant_id

        approved_actuals = list(MonthlyActual.objects.filter(**actuals_filter).values('user_id', 'actual_value'))
        user_actuals_map: Dict[str, Decimal] = {
            str(a['user_id']): Decimal(str(a['actual_value'] or 0))
            for a in approved_actuals
        }

        updated_scores = []

        with transaction.atomic():
            for target_id in targets_to_update:
                target = target_by_id.get(target_id)
                if not target:
                    continue

                descendant_users = get_descendant_user_ids(target_id)
                if not descendant_users:
                    continue

                # Sum approved actuals of descendants
                total_actual = sum((user_actuals_map.get(uid, Decimal('0')) for uid in descendant_users), Decimal('0'))

                # Resolve target value for period:
                # 1. Monthly phasing if exists
                # 2. Annual target value
                period_target_val = Decimal('0')
                phasing = MonthlyPhasing.objects.filter(
                    annual_target=target,
                    month=month
                ).first()
                if phasing and phasing.target_value:
                    period_target_val = Decimal(str(phasing.target_value))
                elif target.target_value:
                    period_target_val = Decimal(str(target.target_value))

                # Compute Score %
                kpi_obj = target.kpi
                calculation_logic = getattr(kpi_obj, 'calculation_logic', 'HIGHER_IS_BETTER')
                
                if period_target_val > Decimal('0'):
                    if calculation_logic == 'LOWER_IS_BETTER':
                        score_val = (period_target_val / total_actual * Decimal('100')) if total_actual > Decimal('0') else Decimal('100')
                    else:
                        score_val = (total_actual / period_target_val * Decimal('100'))
                else:
                    score_val = Decimal('100') if total_actual >= Decimal('0') else Decimal('0')

                score_val = score_val.quantize(Decimal('0.01'))

                # Update or create Score for target owner
                score_obj, created = Score.objects.update_or_create(
                    tenant_id=target.tenant_id,
                    kpi=target.kpi,
                    user_id=target.user_id,
                    year=year,
                    month=month,
                    defaults={
                        'score': score_val,
                        'actual_value': total_actual,
                        'target_value': period_target_val if period_target_val > Decimal('0') else target.target_value,
                        'formula_used': 'CASCADE_ROLLUP',
                        'calculated_by': 'cascade_rollup_engine'
                    }
                )

                # Update TrafficLight
                traffic = self.traffic_evaluator.evaluate(score_obj.score)
                TrafficLight.objects.update_or_create(
                    score=score_obj,
                    defaults={
                        'tenant_id': target.tenant_id,
                        'status': traffic['status'],
                        'score_value': score_val,
                        'green_threshold': traffic['green_threshold'],
                        'yellow_threshold': traffic['yellow_threshold'],
                    }
                )

                if target.user_id:
                    invalidate_user_dashboards(str(target.user_id))

                updated_scores.append({
                    'target_id': target_id,
                    'user_id': str(target.user_id),
                    'actual_value': float(total_actual),
                    'target_value': float(period_target_val or target.target_value),
                    'score': float(score_val),
                    'traffic_light': traffic['status']
                })

        # Invalidate cascade tree and aggregation caches
        safe_delete_pattern(f"{CACHE_PREFIX}:tree:*")
        safe_delete_pattern(f"{CACHE_PREFIX}:contributors:*")
        safe_delete_pattern(f"kpi_dashboard:*")

        return {
            'status': 'SUCCESS',
            'kpi_id': kpi_id,
            'period': f"{year}-{month:02d}",
            'updated_targets_count': len(updated_scores),
            'scores': updated_scores
        }
