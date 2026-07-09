import csv
from io import StringIO
from uuid import UUID
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment
from apps.structure.models.position import Position

class CSVExporterService:
    @staticmethod
    def export_org_units(tenant_id: UUID, include_inactive: bool = False) -> str:
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            units = units.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Level', 'Code', 'Name', 'Description', 'Parent', 'Depth', 'Path', 'Headcount Limit', 'Is Active'])
        for unit in units.select_related('parent'):
            headcount = Employment.objects.filter(
                unit_id=unit.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            writer.writerow([
                unit.level,
                unit.code,
                unit.name,
                unit.description,
                unit.parent.code if unit.parent else '',
                unit.depth,
                unit.path,
                unit.headcount_limit or '',
                unit.is_active
            ])
        return output.getvalue()
    
    @staticmethod
    def export_divisions(tenant_id: UUID, include_inactive: bool = False) -> str:
        divisions = Division.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            divisions = divisions.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Depth', 'Path', 'Headcount Limit', 'Is Active'])
        for div in divisions:
            writer.writerow([
                str(div.id),
                div.code,
                div.name,
                div.description,
                div.depth,
                div.path,
                div.headcount_limit or '',
                div.is_active
            ])
        return output.getvalue()
    
    @staticmethod
    def export_departments(tenant_id: UUID, include_inactive: bool = False) -> str:
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            departments = departments.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Parent Division', 'Depth', 'Path', 'Headcount Limit', 'Sensitivity Level', 'Is Active'])
        for dept in departments.select_related('parent'):
            writer.writerow([
                str(dept.id),
                dept.code,
                dept.name,
                dept.description,
                dept.parent.code if dept.parent else '',
                dept.depth,
                dept.path,
                dept.headcount_limit or '',
                dept.sensitivity_level,
                dept.is_active
            ])
        return output.getvalue()
    
    @staticmethod
    def export_sections(tenant_id: UUID, include_inactive: bool = False) -> str:
        sections = Section.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            sections = sections.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Parent Department', 'Depth', 'Path', 'Headcount Limit', 'Is Active'])
        for section in sections.select_related('parent'):
            writer.writerow([
                str(section.id),
                section.code,
                section.name,
                section.description,
                section.parent.code if section.parent else '',
                section.depth,
                section.path,
                section.headcount_limit or '',
                section.is_active
            ])
        return output.getvalue()
    
    @staticmethod
    def export_units(tenant_id: UUID, include_inactive: bool = False) -> str:
        units = Unit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            units = units.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Parent Section', 'Depth', 'Path', 'Headcount Limit', 'Is Active'])
        for unit in units.select_related('parent'):
            writer.writerow([
                str(unit.id),
                unit.code,
                unit.name,
                unit.description,
                unit.parent.code if unit.parent else '',
                unit.depth,
                unit.path,
                unit.headcount_limit or '',
                unit.is_active
            ])
        return output.getvalue()
    
    @staticmethod
    def export_employments(tenant_id: UUID, current_only: bool = True) -> str:
        employments = Employment.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('position', 'division', 'department', 'section', 'unit')
        if current_only:
            employments = employments.filter(is_current=True, is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User ID', 'Position Code', 'Division', 'Department', 'Section', 'Unit', 'Employment Type', 'Is Manager', 'Is Executive', 'Effective From', 'Effective To', 'Is Current'])
        for emp in employments:
            writer.writerow([
                str(emp.user_id),
                emp.position.job_code if emp.position else '',
                emp.division.code if emp.division else '',
                emp.department.code if emp.department else '',
                emp.section.code if emp.section else '',
                emp.unit.code if emp.unit else '',
                emp.employment_type,
                emp.is_manager,
                emp.is_executive,
                emp.effective_from.isoformat() if emp.effective_from else '',
                emp.effective_to.isoformat() if emp.effective_to else '',
                emp.is_current
            ])
        return output.getvalue()
    
    @staticmethod
    def export_positions(tenant_id: UUID) -> str:
        positions = Position.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('reports_to')
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Job Code', 'Title', 'Grade', 'Level', 'Reports To Code', 'Is Single Incumbent', 'Current Incumbents', 'Max Incumbents'])
        for pos in positions:
            writer.writerow([
                pos.job_code,
                pos.title,
                pos.grade,
                pos.level,
                pos.reports_to.job_code if pos.reports_to else '',
                pos.is_single_incumbent,
                pos.current_incumbents_count,
                pos.max_incumbents or ''
            ])
        return output.getvalue()
    
    @staticmethod
    def export_employments(tenant_id: UUID, active_only: bool = True) -> str:
        from apps.structure.models.employment import Employment
        lines = Employment.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('employee', 'manager')
        if active_only:
            lines = lines.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Employee User ID', 'Manager User ID', 'Effective From', 'Effective To', 'Is Active'])
        for line in lines:
            writer.writerow([
                str(line.employee.user_id) if line.employee else '',
                str(line.manager.user_id) if line.manager else '',
                line.effective_from.isoformat() if line.effective_from else '',
                line.effective_to.isoformat() if line.effective_to else '',
                line.is_active
            ])
        return output.getvalue()