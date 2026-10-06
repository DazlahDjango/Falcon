# apps/reportplt/services/extraction/production/structure_extractor.py
import logging
from typing import Dict, Any, List, Optional
from django.db import models
from django.utils import timezone
from apps.structure.models import (
    Division, Department, Section, Unit, Position, Employment,
    InterimAssignment, CostCenter, CostCenterAllocation, Location
)
from apps.structure.services.reporting.chain_service import ChainService

logger = logging.getLogger(__name__)


def _get_user_map(user_ids: List[Any]) -> Dict[str, Dict[str, str]]:
    """Helper to resolve a batch of User UUIDs to full name and email."""
    from apps.accounts.models import User
    valid_ids = [uid for uid in user_ids if uid]
    if not valid_ids:
        return {}
    users = User.objects.filter(id__in=valid_ids)
    return {
        str(u.id): {
            'full_name': u.get_full_name() or u.username or u.email,
            'email': u.email,
            'role': u.role
        }
        for u in users
    }


class StructureOrgChartExtractor:
    """Extracts 4-level organizational hierarchy (Division -> Department -> Section -> Unit), leadership, and headcount statistics matching show_organization_structure."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        divisions = list(Division.objects.filter(is_active=True, is_deleted=False).order_by('code'))
        departments = list(Department.objects.filter(is_active=True, is_deleted=False).select_related('division', 'parent').order_by('code'))
        sections = list(Section.objects.filter(is_active=True, is_deleted=False).select_related('department').order_by('code'))
        units = list(Unit.objects.filter(is_active=True, is_deleted=False).select_related('section').order_by('code'))
        employments = list(Employment.objects.filter(is_current=True, is_active=True, is_deleted=False).select_related(
            'position', 'position__division', 'position__department', 'position__section', 'position__unit'
        ))

        if self.tenant_id:
            divisions = [d for d in divisions if str(d.tenant_id) == str(self.tenant_id)]
            departments = [d for d in departments if str(d.tenant_id) == str(self.tenant_id)]
            sections = [s for s in sections if str(s.tenant_id) == str(self.tenant_id)]
            units = [u for u in units if str(u.tenant_id) == str(self.tenant_id)]
            employments = [e for e in employments if str(e.tenant_id) == str(self.tenant_id)]

        emp_list = employments

        # Collect all leadership UUIDs for batch resolution
        leader_uids = []
        for d in divisions:
            if getattr(d, 'director_id', None):
                leader_uids.append(d.director_id)
        for dept in departments:
            if getattr(dept, 'manager_id', None):
                leader_uids.append(dept.manager_id)
        for sec in sections:
            if getattr(sec, 'section_lead_id', None):
                leader_uids.append(sec.section_lead_id)
        for unit in units:
            if getattr(unit, 'unit_lead_id', None):
                leader_uids.append(unit.unit_lead_id)

        user_map = _get_user_map(leader_uids)

        div_list = []
        for d in divisions:
            dept_count = sum(1 for dept in departments if dept.division_id == d.id)
            emp_count = sum(1 for e in emp_list if e.position and e.position.division_id == d.id)
            dir_info = user_map.get(str(d.director_id), {}) if getattr(d, 'director_id', None) else {}
            director_str = dir_info.get('full_name') or 'Not Assigned'

            div_list.append({
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'director': director_str,
                'director_email': dir_info.get('email', ''),
                'depth': d.depth,
                'path': d.path or d.code,
                'departments_count': dept_count,
                'employee_count': emp_count,
            })

        dept_list = []
        for dept in departments:
            sec_count = sum(1 for sec in sections if sec.department_id == dept.id)
            emp_count = sum(1 for e in emp_list if e.position and e.position.department_id == dept.id)
            mgr_info = user_map.get(str(dept.manager_id), {}) if getattr(dept, 'manager_id', None) else {}
            mgr_str = mgr_info.get('full_name') or 'Not Assigned'

            dept_list.append({
                'id': str(dept.id),
                'code': dept.code,
                'name': dept.name,
                'division_code': dept.division.code if dept.division else 'N/A',
                'division_name': dept.division.name if dept.division else 'N/A',
                'manager': mgr_str,
                'manager_email': mgr_info.get('email', ''),
                'parent_code': dept.parent.code if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path or dept.code,
                'sensitivity_level': dept.sensitivity_level,
                'sections_count': sec_count,
                'employee_count': emp_count,
            })

        sec_list = []
        for sec in sections:
            u_count = sum(1 for unit in units if unit.section_id == sec.id)
            emp_count = sum(1 for e in emp_list if e.position and e.position.section_id == sec.id)
            lead_info = user_map.get(str(sec.section_lead_id), {}) if getattr(sec, 'section_lead_id', None) else {}
            lead_str = lead_info.get('full_name') or 'Not Assigned'

            sec_list.append({
                'id': str(sec.id),
                'code': sec.code,
                'name': sec.name,
                'department_code': sec.department.code if sec.department else 'N/A',
                'department_name': sec.department.name if sec.department else 'N/A',
                'section_lead': lead_str,
                'section_lead_email': lead_info.get('email', ''),
                'units_count': u_count,
                'employee_count': emp_count,
            })

        unit_list = []
        for unit in units:
            emp_count = sum(1 for e in emp_list if e.position and e.position.unit_id == unit.id)
            lead_info = user_map.get(str(unit.unit_lead_id), {}) if getattr(unit, 'unit_lead_id', None) else {}
            lead_str = lead_info.get('full_name') or 'Not Assigned'

            unit_list.append({
                'id': str(unit.id),
                'code': unit.code,
                'name': unit.name,
                'section_code': unit.section.code if unit.section else 'N/A',
                'section_name': unit.section.name if unit.section else 'N/A',
                'unit_lead': lead_str,
                'unit_lead_email': lead_info.get('email', ''),
                'employee_count': emp_count,
            })

        assigned_users = len({e.user_id for e in emp_list if e.position_id})

        # Build full vertical hierarchy tree from Division down to Unit
        hierarchy_tree = []
        tree_text_lines = []

        for d in divisions:
            d_id = d.id
            dir_info = user_map.get(str(d.director_id), {}) if getattr(d, 'director_id', None) else {}
            director_str = dir_info.get('full_name') or 'Not Assigned'
            director_email = dir_info.get('email', '')
            director_display = f"{director_str} ({director_email})" if director_email else director_str
            div_emps = [e for e in emp_list if e.position and e.position.division_id == d_id]

            div_node = {
                'level': 'DIVISION',
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'leader_title': 'Director',
                'leader_name': director_str,
                'leader_email': director_email,
                'leader_display': director_display,
                'user_count': len(div_emps),
                'departments': []
            }

            tree_text_lines.append(f"[DIVISION] [{d.code}] {d.name}")
            tree_text_lines.append(f"   • Director: {director_display}")
            tree_text_lines.append(f"   • Total Division Users: {len(div_emps)}")

            dept_matches = [dept for dept in departments if dept.division_id == d_id]
            for dept in dept_matches:
                dept_id = dept.id
                mgr_info = user_map.get(str(dept.manager_id), {}) if getattr(dept, 'manager_id', None) else {}
                mgr_str = mgr_info.get('full_name') or 'Not Assigned'
                mgr_email = mgr_info.get('email', '')
                mgr_display = f"{mgr_str} ({mgr_email})" if mgr_email else mgr_str
                dept_emps = [e for e in emp_list if e.position and e.position.department_id == dept_id]

                dept_node = {
                    'level': 'DEPARTMENT',
                    'id': str(dept.id),
                    'code': dept.code,
                    'name': dept.name,
                    'leader_title': 'Manager',
                    'leader_name': mgr_str,
                    'leader_email': mgr_email,
                    'leader_display': mgr_display,
                    'user_count': len(dept_emps),
                    'sensitivity_level': dept.sensitivity_level,
                    'sections': []
                }

                tree_text_lines.append(f"   [DEPARTMENT] [{dept.code}] {dept.name}")
                tree_text_lines.append(f"      • Manager: {mgr_display}")
                tree_text_lines.append(f"      • Department Users: {len(dept_emps)}")

                sec_matches = [s for s in sections if s.department_id == dept_id]
                if not sec_matches:
                    tree_text_lines.append("      (No Sections in this Department)\n")

                for sec in sec_matches:
                    sec_id = sec.id
                    lead_info = user_map.get(str(sec.section_lead_id), {}) if getattr(sec, 'section_lead_id', None) else {}
                    lead_str = lead_info.get('full_name') or 'Not Assigned'
                    lead_email = lead_info.get('email', '')
                    lead_display = f"{lead_str} ({lead_email})" if lead_email else lead_str
                    sec_emps = [e for e in emp_list if e.position and e.position.section_id == sec_id]

                    sec_node = {
                        'level': 'SECTION',
                        'id': str(sec.id),
                        'code': sec.code,
                        'name': sec.name,
                        'leader_title': 'Section Lead',
                        'leader_name': lead_str,
                        'leader_email': lead_email,
                        'leader_display': lead_display,
                        'user_count': len(sec_emps),
                        'units': []
                    }

                    tree_text_lines.append(f"      [SECTION] [{sec.code}] {sec.name}")
                    tree_text_lines.append(f"         • Section Lead: {lead_display}")
                    tree_text_lines.append(f"         • Section Users: {len(sec_emps)}")

                    unit_matches = [u for u in units if u.section_id == sec_id]
                    for unit in unit_matches:
                        u_id = unit.id
                        u_lead_info = user_map.get(str(unit.unit_lead_id), {}) if getattr(unit, 'unit_lead_id', None) else {}
                        u_lead_str = u_lead_info.get('full_name') or 'Not Assigned'
                        u_lead_email = u_lead_info.get('email', '')
                        u_lead_display = f"{u_lead_str} ({u_lead_email})" if u_lead_email else u_lead_str
                        unit_emps = [e for e in emp_list if e.position and e.position.unit_id == u_id]

                        unit_node = {
                            'level': 'UNIT',
                            'id': str(unit.id),
                            'code': unit.code,
                            'name': unit.name,
                            'leader_title': 'Unit Lead',
                            'leader_name': u_lead_str,
                            'leader_email': u_lead_email,
                            'leader_display': u_lead_display,
                            'user_count': len(unit_emps)
                        }

                        tree_text_lines.append(f"         [UNIT] [{unit.code}] {unit.name}")
                        tree_text_lines.append(f"            • Unit Lead: {u_lead_display}")
                        tree_text_lines.append(f"            • Unit Users: {len(unit_emps)}")

                        sec_node['units'].append(unit_node)

                    dept_node['sections'].append(sec_node)

                div_node['departments'].append(dept_node)

            hierarchy_tree.append(div_node)

        return {
            'source': 'structure',
            'summary': {
                'total_divisions': len(div_list),
                'total_departments': len(dept_list),
                'total_sections': len(sec_list),
                'total_units': len(unit_list),
                'total_active_employees': len(emp_list),
                'assigned_users_count': assigned_users,
            },
            'divisions': div_list,
            'departments': dept_list,
            'sections': sec_list,
            'units': unit_list,
            'hierarchy_tree': hierarchy_tree,
            'tree_text': '\n'.join(tree_text_lines),
        }


class StructureSpanOfControlExtractor:
    """Extracts manager direct report counts, indirect report counts, and identifies managers exceeding span-of-control limits."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.chain_service = ChainService()

    def extract(self) -> Dict[str, Any]:
        managers = Employment.objects.filter(is_current=True, is_active=True, is_manager=True).select_related('position', 'position__department')
        if self.tenant_id:
            managers = managers.filter(tenant_id=self.tenant_id)

        mgr_list = list(managers.order_by('-position__title'))
        user_ids = [m.user_id for m in mgr_list]
        user_map = _get_user_map(user_ids)

        # Batch build reporting graph in memory to avoid N+1 DB queries per manager
        all_employments = Employment.objects.filter(is_current=True, is_active=True, is_deleted=False).select_related('position')
        interims = InterimAssignment.objects.filter(is_active=True, is_deleted=False)
        if self.tenant_id:
            all_employments = all_employments.filter(tenant_id=self.tenant_id)
            interims = interims.filter(tenant_id=self.tenant_id)

        emp_by_pos = {}
        for emp in all_employments:
            if emp.position_id:
                emp_by_pos.setdefault(str(emp.position_id), []).append(str(emp.user_id))

        direct_reports_map = {}
        for emp in all_employments:
            if emp.position and emp.position.reports_to_id:
                parent_pos_id = str(emp.position.reports_to_id)
                parent_mgr_user_ids = emp_by_pos.get(parent_pos_id, [])
                for mgr_u_id in parent_mgr_user_ids:
                    direct_reports_map.setdefault(mgr_u_id, set()).add(str(emp.user_id))

        # Add interim assignment direct reports
        now = timezone.now().date()
        for ia in interims.select_related('employee', 'interim_manager'):
            if ia.interim_manager and ia.employee and ia.effective_from <= now <= ia.effective_to:
                mgr_u_id = str(ia.interim_manager.user_id)
                direct_reports_map.setdefault(mgr_u_id, set()).add(str(ia.employee.user_id))

        def get_all_reports_fast(u_id: str, visited: set) -> set:
            if u_id in visited:
                return set()
            visited.add(u_id)
            reports = set(direct_reports_map.get(u_id, set()))
            all_rep = set(reports)
            for child_id in reports:
                if child_id not in visited:
                    all_rep.update(get_all_reports_fast(child_id, visited))
            return all_rep

        manager_span_list = []
        overloaded_managers = 0

        for mgr in mgr_list:
            mgr_u_str = str(mgr.user_id)
            direct_set = direct_reports_map.get(mgr_u_str, set())
            total_set = get_all_reports_fast(mgr_u_str, set())

            direct_count = len(direct_set)
            total_count = len(total_set)

            is_overloaded = direct_count > 15
            if is_overloaded:
                overloaded_managers += 1

            u_info = user_map.get(mgr_u_str, {})
            mgr_name = u_info.get('full_name') or f"User {mgr_u_str[:8]}"
            mgr_email = u_info.get('email') or ''

            manager_span_list.append({
                'manager_id': str(mgr.id),
                'user_id': mgr_u_str,
                'manager_name': mgr_name,
                'manager_email': mgr_email,
                'position_title': mgr.position.title if mgr.position else 'Manager',
                'department_name': mgr.position.department.name if mgr.position and mgr.position.department else 'General',
                'direct_reports_count': direct_count,
                'total_reports_count': total_count,
                'is_overloaded': is_overloaded,
                'is_executive': mgr.is_executive,
            })

        return {
            'source': 'structure',
            'summary': {
                'total_managers': len(manager_span_list),
                'overloaded_managers_count': overloaded_managers,
                'average_direct_reports': round(sum(m['direct_reports_count'] for m in manager_span_list) / len(manager_span_list), 2) if manager_span_list else 0.0,
            },
            'managers': manager_span_list,
        }


class StructureInterimDelegationExtractor:
    """Extracts active interim assignments, acting manager delegations, and remaining validity periods."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        interims = InterimAssignment.objects.filter(is_active=True).select_related('employee', 'interim_manager')
        if self.tenant_id:
            interims = interims.filter(tenant_id=self.tenant_id)

        all_uids = []
        for ia in interims:
            if ia.employee:
                all_uids.append(ia.employee.user_id)
            if ia.interim_manager:
                all_uids.append(ia.interim_manager.user_id)
        user_map = _get_user_map(all_uids)

        interim_list = []
        expiring_soon_count = 0

        for ia in interims.order_by('-effective_from'):
            days_left = ia.days_remaining
            if days_left <= 7:
                expiring_soon_count += 1

            emp_uid = str(ia.employee.user_id) if ia.employee else ''
            mgr_uid = str(ia.interim_manager.user_id) if ia.interim_manager else ''

            emp_info = user_map.get(emp_uid, {})
            mgr_info = user_map.get(mgr_uid, {})

            interim_list.append({
                'id': str(ia.id),
                'employee_user_id': emp_uid,
                'employee_name': emp_info.get('full_name') or f"User {emp_uid[:8]}",
                'employee_email': emp_info.get('email') or '',
                'interim_manager_user_id': mgr_uid,
                'interim_manager_name': mgr_info.get('full_name') or f"Manager {mgr_uid[:8]}",
                'interim_manager_email': mgr_info.get('email') or '',
                'reporting_type': ia.reporting_type,
                'effective_from': ia.effective_from.isoformat() if ia.effective_from else None,
                'effective_to': ia.effective_to.isoformat() if ia.effective_to else None,
                'days_remaining': days_left,
                'is_current': ia.is_current,
                'reason': ia.reason or 'Delegation of Authority',
            })

        return {
            'source': 'structure',
            'summary': {
                'total_active_interim_assignments': len(interim_list),
                'expiring_in_7_days': expiring_soon_count,
            },
            'interim_assignments': interim_list,
        }


class StructureCostCenterAllocationExtractor:
    """Extracts cost center categories, budget allocations, department cost splits, and physical location hubs."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cost_centers = list(CostCenter.objects.filter(is_active=True).order_by('code'))
        allocations = list(CostCenterAllocation.objects.all().select_related('cost_center', 'content_type'))
        locations = list(Location.objects.filter(is_active=True).order_by('code'))

        if self.tenant_id:
            cost_centers = [cc for cc in cost_centers if str(cc.tenant_id) == str(self.tenant_id)]
            allocations = [a for a in allocations if str(a.tenant_id) == str(self.tenant_id)]
            locations = [loc for loc in locations if str(loc.tenant_id) == str(self.tenant_id)]

        cc_list = []
        total_budget = 0.0

        for cc in cost_centers:
            b_val = float(cc.budget_amount) if cc.budget_amount else 0.0
            total_budget += b_val
            dept_allocs_count = sum(1 for a in allocations if a.cost_center_id == cc.id)

            cc_list.append({
                'id': str(cc.id),
                'code': cc.code,
                'name': cc.name,
                'category': cc.category,
                'currency': cc.currency or 'USD',
                'budget_amount': b_val,
                'allocated_departments_count': dept_allocs_count,
            })

        loc_list = []
        for loc in locations:
            loc_type = getattr(loc, 'type', 'branch')
            loc_list.append({
                'id': str(loc.id),
                'code': loc.code,
                'name': loc.name,
                'location_type': loc_type,
                'city': loc.city or 'N/A',
                'country': loc.country or 'N/A',
                'is_headquarters': loc.is_headquarters,
            })

        return {
            'source': 'structure',
            'summary': {
                'total_cost_centers': len(cc_list),
                'total_budget_allocated': round(total_budget, 2),
                'total_locations': len(loc_list),
            },
            'cost_centers': cc_list,
            'locations': loc_list,
        }


class StructureSecuritySensitivityExtractor:
    """Extracts department sensitivity level distributions and scope enforcement statistics."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        departments = list(Department.objects.filter(is_active=True))
        if self.tenant_id:
            departments = [d for d in departments if str(d.tenant_id) == str(self.tenant_id)]

        sensitivity_counts = {'public': 0, 'internal': 0, 'confidential': 0, 'restricted': 0}
        for d in departments:
            lvl = d.sensitivity_level or 'internal'
            if lvl in sensitivity_counts:
                sensitivity_counts[lvl] += 1
            else:
                sensitivity_counts['internal'] += 1

        mgr_uids = [d.manager_id for d in departments if d.manager_id]
        user_map = _get_user_map(mgr_uids)

        restricted_depts = []
        sensitive_deps = [d for d in departments if d.sensitivity_level in ['confidential', 'restricted']]
        sensitive_deps.sort(key=lambda d: d.code)

        for d in sensitive_deps:
            m_uid = str(d.manager_id) if d.manager_id else ''
            m_info = user_map.get(m_uid, {})
            m_name = m_info.get('full_name') or (f"Manager {m_uid[:8]}" if m_uid else 'Unassigned')

            restricted_depts.append({
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'sensitivity_level': d.sensitivity_level,
                'manager_id': m_uid or None,
                'manager_name': m_name,
            })

        return {
            'source': 'structure',
            'summary': {
                'total_monitored_departments': len(departments),
                'sensitivity_breakdown': sensitivity_counts,
                'restricted_confidential_count': sensitivity_counts['confidential'] + sensitivity_counts['restricted'],
            },
            'sensitive_departments': restricted_depts,
        }


class StructureUnifiedExtractor:
    """Master Unified Extractor orchestrating real-data structure extractions across org charts, span-of-control, interim management, and cost centers."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.org_chart_extractor = StructureOrgChartExtractor(tenant_id, filters)
        self.span_extractor = StructureSpanOfControlExtractor(tenant_id, filters)
        self.interim_extractor = StructureInterimDelegationExtractor(tenant_id, filters)
        self.cost_center_extractor = StructureCostCenterAllocationExtractor(tenant_id, filters)
        self.security_extractor = StructureSecuritySensitivityExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        chart_data = self.org_chart_extractor.extract()
        span_data = self.span_extractor.extract()
        interim_data = self.interim_extractor.extract()
        cost_data = self.cost_center_extractor.extract()
        sec_data = self.security_extractor.extract()

        return {
            'source': 'structure',
            'extracted_at': timezone.now().isoformat(),
            'org_chart': chart_data,
            'span_of_control': span_data,
            'interim_delegation': interim_data,
            'cost_center_allocation': cost_data,
            'security_sensitivity': sec_data,
            'summary': {
                'total_divisions': chart_data['summary']['total_divisions'],
                'total_departments': chart_data['summary']['total_departments'],
                'total_active_employees': chart_data['summary']['total_active_employees'],
                'total_managers': span_data['summary']['total_managers'],
                'overloaded_managers_count': span_data['summary']['overloaded_managers_count'],
                'active_interim_assignments': interim_data['summary']['total_active_interim_assignments'],
                'total_budget_allocated': cost_data['summary']['total_budget_allocated'],
            }
        }


StructureDataExtractor = StructureUnifiedExtractor


