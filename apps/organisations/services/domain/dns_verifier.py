"""
DNS Verifier Service - Verifies custom domain DNS records
"""

import logging
import dns.resolver
from apps.organisations.models import Domain
from apps.organisations.constants import DomainVerificationStatus
from apps.organisations.exceptions import DNSVerificationError

logger = logging.getLogger(__name__)


class DNSVerifierService:
    """
    Service for verifying DNS records for custom domains
    """
    
    @classmethod
    def verify_domain(cls, domain):
        """
        Verify a domain by checking its DNS TXT record
        
        Args:
            domain: Domain instance
        
        Returns:
            bool: True if verified
        """
        try:
            # Look up TXT record
            answers = dns.resolver.resolve(domain.domain_name, 'TXT')
            
            for answer in answers:
                for txt_string in answer.strings:
                    txt_value = txt_string.decode('utf-8')
                    # Check if the verification token matches
                    if domain.verification_token in txt_value:
                        domain.verification_status = DomainVerificationStatus.VERIFIED
                        domain.save()
                        logger.info(f"Domain verified: {domain.domain_name}")
                        return True
            
            # No matching TXT record found
            logger.warning(f"Domain verification failed: {domain.domain_name}")
            return False
            
        except dns.resolver.NXDOMAIN:
            logger.warning(f"Domain does not exist: {domain.domain_name}")
            domain.verification_status = DomainVerificationStatus.FAILED
            domain.save()
            raise DNSVerificationError(f"Domain does not exist: {domain.domain_name}")
            
        except dns.resolver.NoAnswer:
            logger.warning(f"No TXT record found for domain: {domain.domain_name}")
            return False
            
        except Exception as e:
            logger.error(f"DNS lookup failed for {domain.domain_name}: {e}")
            raise DNSVerificationError(f"DNS lookup failed: {e}")
    
    @classmethod
    def get_verification_record(cls, domain):
        """
        Get the DNS TXT record that needs to be added
        
        Args:
            domain: Domain instance
        
        Returns:
            dict: Verification record details
        """
        return {
            'type': 'TXT',
            'name': f"_falcon-verify.{domain.domain_name}",
            'value': domain.verification_token,
            'ttl': 300,
        }