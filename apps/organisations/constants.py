"""
Organisations App Constants
All choices and constants used across the organisations app
"""

from django.db import models


class SectorType(models.TextChoices):
    """Types of organisations/sectors"""
    COMMERCIAL = 'commercial', 'Commercial / Corporate'
    NGO = 'ngo', 'NGO / Non-Profit'
    PUBLIC = 'public', 'Public Sector / Government'
    CONSULTING = 'consulting', 'Consulting / Professional Services'
    EDUCATION = 'education', 'Education'
    HEALTHCARE = 'healthcare', 'Healthcare'
    TECHNOLOGY = 'technology', 'Technology / IT'
    MANUFACTURING = 'manufacturing', 'Manufacturing'
    RETAIL = 'retail', 'Retail / E-commerce'
    OTHER = 'other', 'Other'


class OrganisationStatus(models.TextChoices):
    """Status of an organisation/tenant"""
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    PENDING = 'pending', 'Pending Setup'
    ARCHIVED = 'archived', 'Archived'
    TRIAL = 'trial', 'Trial'
    EXPIRED = 'expired', 'Expired'


class PlanCode(models.TextChoices):
    """Subscription plan codes"""
    BASIC = 'basic', 'Basic'
    PROFESSIONAL = 'professional', 'Professional'
    ENTERPRISE = 'enterprise', 'Enterprise'
    CUSTOM = 'custom', 'Custom'


class SubscriptionStatus(models.TextChoices):
    """Status of a subscription"""
    TRIALING = 'trialing', 'Trialing'
    ACTIVE = 'active', 'Active'
    PAST_DUE = 'past_due', 'Past Due'
    CANCELLED = 'cancelled', 'Cancelled'
    EXPIRED = 'expired', 'Expired'
    INCOMPLETE = 'incomplete', 'Incomplete'


class DomainVerificationStatus(models.TextChoices):
    """Status of custom domain verification"""
    PENDING = 'pending', 'Pending'
    VERIFIED = 'verified', 'Verified'
    FAILED = 'failed', 'Failed'
    EXPIRED = 'expired', 'Expired'


class SSLStatus(models.TextChoices):
    """Status of SSL certificates"""
    PENDING = 'pending', 'Pending'
    ACTIVE = 'active', 'Active'
    EXPIRED = 'expired', 'Expired'
    FAILED = 'failed', 'Failed'
    ISSUING = 'issuing', 'Issuing'


class ReviewCycle(models.TextChoices):
    """Review cycle periods"""
    ANNUAL = 'annual', 'Annual'
    BIANNUAL = 'biannual', 'Bi-Annual (Twice a year)'
    QUARTERLY = 'quarterly', 'Quarterly'
    MONTHLY = 'monthly', 'Monthly'
    CUSTOM = 'custom', 'Custom'


class HierarchyLevel(models.IntegerChoices):
    """Hierarchy levels in organisation"""
    CEO = 1, 'CEO / Executive Director'
    EXECUTIVE = 2, 'Executive / C-Suite'
    DIRECTOR = 3, 'Director'
    HEAD = 4, 'Head of Department'
    MANAGER = 5, 'Manager'
    SUPERVISOR = 6, 'Supervisor'
    STAFF = 7, 'Staff'
    INTERN = 8, 'Intern / Trainee'