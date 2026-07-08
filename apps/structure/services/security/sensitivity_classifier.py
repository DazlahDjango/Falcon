from typing import Optional, List, Dict, Any
from uuid import UUID
from apps.structure.models.employment import Employment
from apps.structure.models.department import Department
from apps.structure.models.position import Position

class SensitivityClassifierService:
    SENSITIVITY_LEVELS = {
        'public': 0,
        'internal': 1,
        'confidential': 2,
        'restricted': 3
    }
    
    @staticmethod
    def classify_org_unit(org_unit) -> str:
        if not org_unit:
            return 'public'
        if hasattr(org_unit, 'sensitivity_level') and org_unit.sensitivity_level:
            return org_unit.sensitivity_level
        if org_unit.name.lower() in ['hr', 'human resources', 'finance', 'legal', 'audit']:
            return 'confidential'
        if org_unit.name.lower() in ['executive', 'board', 'ceo', 'president']:
            return 'restricted'
        return 'internal'
    
    @staticmethod
    def classify_department(department: Department) -> str:
        if not department:
            return 'public'
        if department.sensitivity_level:
            return department.sensitivity_level
        if department.name.lower() in ['hr', 'human resources', 'finance', 'legal', 'audit']:
            return 'confidential'
        if department.name.lower() in ['executive', 'board', 'ceo']:
            return 'restricted'
        return 'internal'
    
    @staticmethod
    def classify_position(position: Position) -> str:
        if not position:
            return 'public'
        if position.level <= 3:
            return 'restricted'
        if position.level <= 5:
            return 'confidential'
        if position.level <= 8:
            return 'internal'
        return 'public'
    
    @staticmethod
    def classify_user_data(user_employment: Employment) -> str:
        if not user_employment:
            return 'public'
        if user_employment.is_executive or user_employment.is_board_member:
            return 'restricted'
        if user_employment.is_manager:
            return 'confidential'
        if user_employment.position and user_employment.position.level <= 8:
            return 'internal'
        return 'public'
    
    @staticmethod
    def can_access_sensitivity(user_clearance: str, data_sensitivity: str) -> bool:
        user_level = SensitivityClassifierService.SENSITIVITY_LEVELS.get(user_clearance, 0)
        data_level = SensitivityClassifierService.SENSITIVITY_LEVELS.get(data_sensitivity, 0)
        return user_level >= data_level
    
    @staticmethod
    def get_required_clearance_for_export(data_type: str) -> str:
        export_requirements = {
            'org_chart': 'public',
            'employee_list': 'internal',
            'salary_report': 'confidential',
            'performance_reviews': 'confidential',
            'board_report': 'restricted',
            'pip_documents': 'restricted',
            'org_structure': 'internal',
            'reporting_chain': 'internal'
        }
        return export_requirements.get(data_type, 'internal')