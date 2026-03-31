"""
Usage Reporter Service - Tracks organisation usage
"""

import logging

logger = logging.getLogger(__name__)


class UsageReporterService:
    """
    Service for reporting organisation usage
    """
    
    @classmethod
    def get_usage_stats(cls, organisation):
        """Get usage statistics for an organisation"""
        return {
            'total_users': organisation.get_active_users_count(),
            'total_departments': organisation.departments.count(),
            'total_teams': organisation.teams.count(),
            'total_positions': organisation.positions.count(),
        }