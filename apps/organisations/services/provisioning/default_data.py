"""
Default Data Loader - Populates default data for new organisations
"""

import logging
from django.db import transaction

from apps.organisations.models import Department, Position, Contact

logger = logging.getLogger(__name__)


class DefaultDataLoader:
    """
    Service for loading default data into new organisations
    """
    
    @classmethod
    @transaction.atomic
    def load_default_data(cls, organisation):
        """
        Load all default data for a new organisation
        
        Args:
            organisation: Organisation instance
        """
        cls.create_default_departments(organisation)
        cls.create_default_positions(organisation)
        cls.create_default_contacts(organisation)
        
        logger.info(f"Loaded default data for: {organisation.name}")
    
    @classmethod
    def create_default_departments(cls, organisation):
        """Create default departments"""
        default_departments = [
            {'name': 'Executive', 'code': 'EXEC', 'description': 'Executive Leadership'},
            {'name': 'Human Resources', 'code': 'HR', 'description': 'Human Resources Management'},
            {'name': 'Finance', 'code': 'FIN', 'description': 'Finance and Accounting'},
            {'name': 'Operations', 'code': 'OPS', 'description': 'Operations Management'},
            {'name': 'Sales', 'code': 'SALES', 'description': 'Sales and Business Development'},
            {'name': 'Marketing', 'code': 'MKT', 'description': 'Marketing and Communications'},
            {'name': 'IT', 'code': 'IT', 'description': 'Information Technology'},
            {'name': 'Customer Support', 'code': 'SUPPORT', 'description': 'Customer Service'},
        ]
        
        departments = []
        for dept_data in default_departments:
            dept, created = Department.objects.get_or_create(
                organisation=organisation,
                name=dept_data['name'],
                defaults={
                    'code': dept_data['code'],
                    'description': dept_data['description'],
                    'is_active': True,
                }
            )
            departments.append(dept)
            if created:
                logger.debug(f"Created department: {dept.name}")
        
        return departments
    
    @classmethod
    def create_default_positions(cls, organisation):
        """Create default positions"""
        default_positions = [
            {'title': 'Chief Executive Officer', 'code': 'CEO', 'level': 1, 'is_management': True},
            {'title': 'Department Head', 'code': 'HEAD', 'level': 2, 'is_management': True},
            {'title': 'Manager', 'code': 'MGR', 'level': 3, 'is_management': True},
            {'title': 'Senior Staff', 'code': 'SR', 'level': 4, 'is_management': False},
            {'title': 'Staff', 'code': 'STAFF', 'level': 5, 'is_management': False},
            {'title': 'Intern', 'code': 'INT', 'level': 6, 'is_management': False},
        ]
        
        # Get or create departments for positions
        exec_dept = Department.objects.filter(organisation=organisation, code='EXEC').first()
        hr_dept = Department.objects.filter(organisation=organisation, code='HR').first()
        
        positions = []
        for pos_data in default_positions:
            department = exec_dept if pos_data['level'] == 1 else hr_dept
            
            if department:
                pos, created = Position.objects.get_or_create(
                    department=department,
                    title=pos_data['title'],
                    defaults={
                        'code': pos_data['code'],
                        'level': pos_data['level'],
                        'is_management': pos_data['is_management'],
                    }
                )
                positions.append(pos)
                if created:
                    logger.debug(f"Created position: {pos.title}")
        
        return positions
    
    @classmethod
    def create_default_contacts(cls, organisation):
        """Create default contact for the organisation"""
        if organisation.contact_email:
            contact, created = Contact.objects.get_or_create(
                organisation=organisation,
                email=organisation.contact_email,
                defaults={
                    'contact_type': 'primary',
                    'name': organisation.name,
                    'is_primary': True,
                    'receives_notifications': True,
                }
            )
            if created:
                logger.debug(f"Created default contact for: {organisation.name}")
            return contact
        return None