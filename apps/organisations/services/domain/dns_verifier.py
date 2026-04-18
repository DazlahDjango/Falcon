"""
DNS Verifier Service - Verifies custom domain DNS records
Uses dnspython library for actual DNS lookups
"""

import logging
import dns.resolver
import dns.exception
from django.utils import timezone
from apps.organisations.models import Domain
from apps.organisations.constants import DomainVerificationStatus, SSLStatus
from apps.organisations.exceptions import DNSVerificationError

logger = logging.getLogger(__name__)


class DNSVerifierService:
    """
    Service for verifying DNS records for custom domains
    Performs actual DNS TXT record lookups
    """
    
    @classmethod
    def verify_domain(cls, domain):
        """
        Verify a domain by checking its DNS TXT record
        
        Args:
            domain: Domain instance
        
        Returns:
            bool: True if verified
        
        Raises:
            DNSVerificationError: If DNS lookup fails
        """
        try:
            logger.info(f"Starting DNS verification for: {domain.domain_name}")
            
            # Look up TXT records for the domain
            answers = dns.resolver.resolve(domain.domain_name, 'TXT')
            
            # Check each TXT record for the verification token
            for answer in answers:
                for txt_string in answer.strings:
                    txt_value = txt_string.decode('utf-8')
                    logger.debug(f"Found TXT record: {txt_value}")
                    
                    # Check if the verification token is in the TXT record
                    # The token can be standalone or part of a larger string
                    if domain.verification_token in txt_value:
                        domain.verification_status = DomainVerificationStatus.VERIFIED
                        domain.save()
                        logger.info(f"✅ Domain verified successfully: {domain.domain_name}")
                        return True
            
            # No matching TXT record found
            logger.warning(f"No matching TXT record found for: {domain.domain_name}")
            domain.verification_status = DomainVerificationStatus.FAILED
            domain.save()
            return False
            
        except dns.resolver.NXDOMAIN:
            logger.error(f"Domain does not exist: {domain.domain_name}")
            domain.verification_status = DomainVerificationStatus.FAILED
            domain.save()
            raise DNSVerificationError(f"Domain does not exist: {domain.domain_name}")
            
        except dns.resolver.NoAnswer:
            logger.warning(f"No TXT records found for domain: {domain.domain_name}")
            # Try checking with _falcon-verify subdomain
            return cls._check_subdomain_verification(domain)
            
        except dns.resolver.Timeout:
            logger.error(f"DNS lookup timeout for: {domain.domain_name}")
            raise DNSVerificationError(f"DNS lookup timeout for: {domain.domain_name}")
            
        except dns.exception.DNSException as e:
            logger.error(f"DNS lookup failed for {domain.domain_name}: {e}")
            raise DNSVerificationError(f"DNS lookup failed: {str(e)}")
        
        except Exception as e:
            logger.error(f"Unexpected error during DNS verification: {e}")
            raise DNSVerificationError(f"Verification failed: {str(e)}")
    
    @classmethod
    def _check_subdomain_verification(cls, domain):
        """
        Check verification using the _falcon-verify subdomain
        Some DNS providers require a specific subdomain for verification
        """
        try:
            verify_subdomain = f"_falcon-verify.{domain.domain_name}"
            answers = dns.resolver.resolve(verify_subdomain, 'TXT')
            
            for answer in answers:
                for txt_string in answer.strings:
                    txt_value = txt_string.decode('utf-8')
                    if domain.verification_token in txt_value:
                        domain.verification_status = DomainVerificationStatus.VERIFIED
                        domain.save()
                        logger.info(f"✅ Domain verified via subdomain: {verify_subdomain}")
                        return True
            
            logger.warning(f"No verification record found for: {domain.domain_name}")
            domain.verification_status = DomainVerificationStatus.FAILED
            domain.save()
            return False
            
        except Exception as e:
            logger.error(f"Subdomain verification failed: {e}")
            domain.verification_status = DomainVerificationStatus.FAILED
            domain.save()
            return False
    
    @classmethod
    def get_verification_record(cls, domain):
        """
        Get the DNS TXT record that needs to be added
        
        Args:
            domain: Domain instance
        
        Returns:
            dict: Verification record details with instructions
        """
        return {
            'type': 'TXT',
            'name': domain.domain_name,
            'value': domain.verification_token,
            'alternative_name': f"_falcon-verify.{domain.domain_name}",
            'ttl': 300,
            'instructions': """
To verify your domain, add the following DNS TXT record:

Type: TXT
Name: {domain_name}
Value: {verification_token}
TTL: 300 (or default)

Alternative (if your DNS provider doesn't allow @ records):
Name: _falcon-verify.{domain_name}
Value: {verification_token}

Once added, run verification again. DNS propagation may take 5-30 minutes.
            """.format(
                domain_name=domain.domain_name,
                verification_token=domain.verification_token
            )
        }
    
    @classmethod
    def check_ssl_certificate(cls, domain):
        """
        Check SSL certificate status for a domain
        """
        import ssl
        import socket
        
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain.domain_name, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain.domain_name) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Extract certificate expiry date
                    expiry_date = cert.get('notAfter')
                    if expiry_date:
                        from datetime import datetime
                        expiry_datetime = datetime.strptime(expiry_date, '%b %d %H:%M:%S %Y %Z')
                        
                        domain.ssl_status = SSLStatus.ACTIVE
                        domain.ssl_expiry_date = expiry_datetime
                        domain.save()
                        
                        logger.info(f"SSL certificate found for {domain.domain_name}, expires: {expiry_date}")
                        return {
                            'status': 'active',
                            'expiry_date': expiry_date,
                            'issuer': cert.get('issuer'),
                            'subject': cert.get('subject')
                        }
            
            return {'status': 'no_certificate', 'message': 'No SSL certificate found'}
            
        except socket.gaierror:
            logger.error(f"Cannot resolve domain for SSL check: {domain.domain_name}")
            return {'status': 'error', 'message': 'Domain cannot be resolved'}
        except ConnectionRefusedError:
            logger.error(f"Connection refused for SSL check: {domain.domain_name}")
            return {'status': 'error', 'message': 'Port 443 is not open'}
        except ssl.SSLCertVerificationError as e:
            logger.error(f"SSL certificate verification failed: {e}")
            domain.ssl_status = SSLStatus.FAILED
            domain.save()
            return {'status': 'invalid', 'message': str(e)}
        except Exception as e:
            logger.error(f"SSL check failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    @classmethod
    def bulk_verify_domains(cls, domains=None):
        """
        Verify multiple domains in bulk
        
        Args:
            domains: QuerySet of domains to verify (optional)
        
        Returns:
            dict: Summary of verification results
        """
        from apps.organisations.models import Domain
        
        if domains is None:
            domains = Domain.objects.filter(
                verification_status=DomainVerificationStatus.PENDING
            )
        
        results = {
            'total': domains.count(),
            'verified': 0,
            'failed': 0,
            'errors': []
        }
        
        for domain in domains:
            try:
                verified = cls.verify_domain(domain)
                if verified:
                    results['verified'] += 1
                else:
                    results['failed'] += 1
            except DNSVerificationError as e:
                results['failed'] += 1
                results['errors'].append({
                    'domain': domain.domain_name,
                    'error': str(e)
                })
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'domain': domain.domain_name,
                    'error': f"Unexpected error: {str(e)}"
                })
        
        logger.info(f"Bulk verification completed: {results['verified']} verified, {results['failed']} failed")
        return results
    
    @classmethod
    def check_propagation_status(cls, domain):
        """
        Check if DNS changes have propagated
        
        Returns:
            dict: Propagation status from multiple DNS servers
        """
        # List of public DNS servers to check
        dns_servers = [
            '8.8.8.8',      # Google
            '1.1.1.1',      # Cloudflare
            '9.9.9.9',      # Quad9
            '208.67.222.222', # OpenDNS
        ]
        
        results = {}
        
        for dns_server in dns_servers:
            try:
                resolver = dns.resolver.Resolver()
                resolver.nameservers = [dns_server]
                resolver.timeout = 5
                resolver.lifetime = 10
                
                answers = resolver.resolve(domain.domain_name, 'TXT')
                found = False
                
                for answer in answers:
                    for txt_string in answer.strings:
                        if domain.verification_token in txt_string.decode('utf-8'):
                            found = True
                            break
                    if found:
                        break
                
                results[dns_server] = {
                    'status': 'propagated' if found else 'pending',
                    'server_name': cls._get_dns_server_name(dns_server)
                }
                
            except Exception as e:
                results[dns_server] = {
                    'status': 'error',
                    'error': str(e),
                    'server_name': cls._get_dns_server_name(dns_server)
                }
        
        return results
    
    @classmethod
    def _get_dns_server_name(cls, ip):
        """Get friendly name for DNS server IP"""
        names = {
            '8.8.8.8': 'Google DNS',
            '1.1.1.1': 'Cloudflare DNS',
            '9.9.9.9': 'Quad9 DNS',
            '208.67.222.222': 'OpenDNS',
        }
        return names.get(ip, ip)