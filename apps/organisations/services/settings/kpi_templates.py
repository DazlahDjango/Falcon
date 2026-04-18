"""
KPI Templates Service - Provides sector-specific KPI templates
"""

import logging

logger = logging.getLogger(__name__)


class KPITemplatesService:
    """
    Service for providing KPI templates based on organisation sector
    """
    
    # Predefined templates for different sectors
    TEMPLATES = {
        'commercial': {
            'name': 'Commercial / Corporate KPIs',
            'description': 'Standard KPIs for commercial organisations',
            'sector': 'commercial',
            'kpis': [
                {'name': 'Revenue Growth', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Profit Margin', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Customer Acquisition Cost', 'type': 'financial', 'unit': 'USD', 'direction': 'lower_better', 'weight': 15},
                {'name': 'Customer Lifetime Value', 'type': 'financial', 'unit': 'USD', 'direction': 'higher_better', 'weight': 15},
                {'name': 'Market Share', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 10},
                {'name': 'Employee Satisfaction', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 10},
                {'name': 'Customer Retention Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 5},
            ]
        },
        'ngo': {
            'name': 'NGO / Non-Profit KPIs',
            'description': 'Standard KPIs for non-profit organisations',
            'sector': 'ngo',
            'kpis': [
                {'name': 'Beneficiaries Reached', 'type': 'count', 'unit': 'people', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Grant Utilization', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Program Impact Score', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Donor Retention Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 15},
                {'name': 'Cost per Beneficiary', 'type': 'financial', 'unit': 'USD', 'direction': 'lower_better', 'weight': 10},
                {'name': 'Volunteer Engagement', 'type': 'count', 'unit': 'hours', 'direction': 'higher_better', 'weight': 10},
            ]
        },
        'public': {
            'name': 'Public Sector KPIs',
            'description': 'Standard KPIs for government and public sector',
            'sector': 'public',
            'kpis': [
                {'name': 'Service Delivery Time', 'type': 'time', 'unit': 'days', 'direction': 'lower_better', 'weight': 25},
                {'name': 'Compliance Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Citizen Satisfaction', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Budget Utilization', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 15},
                {'name': 'Project Completion Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 15},
            ]
        },
        'healthcare': {
            'name': 'Healthcare KPIs',
            'description': 'Standard KPIs for healthcare organisations',
            'sector': 'healthcare',
            'kpis': [
                {'name': 'Patient Satisfaction', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Wait Time', 'type': 'time', 'unit': 'minutes', 'direction': 'lower_better', 'weight': 20},
                {'name': 'Readmission Rate', 'type': 'percentage', 'unit': '%', 'direction': 'lower_better', 'weight': 20},
                {'name': 'Treatment Success Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Patient Throughput', 'type': 'count', 'unit': 'patients', 'direction': 'higher_better', 'weight': 15},
            ]
        },
        'education': {
            'name': 'Education KPIs',
            'description': 'Standard KPIs for educational institutions',
            'sector': 'education',
            'kpis': [
                {'name': 'Graduation Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Student Retention', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Student Satisfaction', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 20},
                {'name': 'Teacher-to-Student Ratio', 'type': 'ratio', 'unit': 'ratio', 'direction': 'higher_better', 'weight': 15},
                {'name': 'College Admission Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 10},
                {'name': 'Research Output', 'type': 'count', 'unit': 'papers', 'direction': 'higher_better', 'weight': 10},
            ]
        },
        'technology': {
            'name': 'Technology KPIs',
            'description': 'Standard KPIs for technology companies',
            'sector': 'technology',
            'kpis': [
                {'name': 'Monthly Recurring Revenue', 'type': 'financial', 'unit': 'USD', 'direction': 'higher_better', 'weight': 25},
                {'name': 'Churn Rate', 'type': 'percentage', 'unit': '%', 'direction': 'lower_better', 'weight': 20},
                {'name': 'User Growth', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 15},
                {'name': 'System Uptime', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 15},
                {'name': 'Feature Adoption Rate', 'type': 'percentage', 'unit': '%', 'direction': 'higher_better', 'weight': 10},
                {'name': 'Net Promoter Score', 'type': 'score', 'unit': 'score', 'direction': 'higher_better', 'weight': 10},
                {'name': 'Time to Market', 'type': 'time', 'unit': 'days', 'direction': 'lower_better', 'weight': 5},
            ]
        }
    }
    
    @classmethod
    def get_template_for_sector(cls, sector):
        """
        Get KPI template for a specific sector
        
        Args:
            sector: Sector type (commercial, ngo, public, healthcare, education, technology)
        
        Returns:
            dict: Template data or None if not found
        """
        return cls.TEMPLATES.get(sector)
    
    @classmethod
    def get_all_templates(cls):
        """
        Get all available KPI templates
        """
        return cls.TEMPLATES
    
    @classmethod
    def get_sector_kpis(cls, sector):
        """
        Get only the KPIs for a specific sector
        """
        template = cls.get_template_for_sector(sector)
        if template:
            return template.get('kpis', [])
        return []
    
    @classmethod
    def get_sector_template_names(cls):
        """
        Get list of available sector template names
        """
        return [
            {
                'sector': sector,
                'name': data['name'],
                'description': data['description'],
                'kpi_count': len(data.get('kpis', []))
            }
            for sector, data in cls.TEMPLATES.items()
        ]
    
    @classmethod
    def get_kpi_by_name(cls, sector, kpi_name):
        """
        Get a specific KPI by name from a sector template
        """
        kpis = cls.get_sector_kpis(sector)
        for kpi in kpis:
            if kpi['name'].lower() == kpi_name.lower():
                return kpi
        return None
    
    @classmethod
    def get_total_kpis_count(cls):
        """
        Get total number of KPIs across all templates
        """
        total = 0
        for template in cls.TEMPLATES.values():
            total += len(template.get('kpis', []))
        return total
    
    @classmethod
    def apply_template_to_organisation(cls, organisation, sector, user=None):
        """
        Apply KPI template to an organisation
        
        This will be fully implemented in the KPI app.
        For now, it returns the template data that would be applied.
        """
        template = cls.get_template_for_sector(sector)
        
        if not template:
            return {
                'success': False,
                'message': f'No template found for sector: {sector}'
            }
        
        logger.info(f"Template '{template['name']}' would be applied to {organisation.name}")
        
        return {
            'success': True,
            'message': f'Template will be applied when KPI app is ready',
            'template': template,
            'kpis_to_create': len(template.get('kpis', []))
        }