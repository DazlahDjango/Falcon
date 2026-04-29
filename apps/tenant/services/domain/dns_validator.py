"""
DNS Validator Service - Validates domain ownership via DNS records.

Handles:
- DNS TXT record verification
- DNS lookup caching
- Verification status tracking
"""

import logging
import dns.resolver
from django.core.cache import cache

logger = logging.getLogger(__name__)


class DNSValidator:
    """
    Validates domain ownership using DNS TXT records.

    What it does:
        - Looks up DNS TXT records for domains
        - Checks if verification token matches
        - Caches DNS lookup results to avoid rate limiting
        - Supports DNS propagation delay

    Usage:
        validator = DNSValidator()
        is_valid = validator.verify_domain('example.com', token)
        txt_records = validator.get_txt_records('example.com')
    """

    def __init__(self, cache_ttl=300):
        """
        Initialize DNS validator.

        Args:
            cache_ttl: Cache TTL in seconds for DNS results
        """
        self.cache_ttl = cache_ttl
        self.logger = logging.getLogger(__name__)

    def verify_domain(self, domain_name, verification_token):
        """
        Verify domain ownership by checking DNS TXT record.

        Args:
            domain_name: Domain to verify
            verification_token: Expected token value

        Returns:
            bool: True if verification succeeds
        """
        self.logger.info(f"Verifying domain {domain_name}")

        expected_record = f"falcon-domain-verification={verification_token}"
        txt_records = self.get_txt_records(domain_name)

        for record in txt_records:
            if record == expected_record or verification_token in record:
                self.logger.info(f"Domain {domain_name} verified successfully")
                return True

        self.logger.warning(f"Domain {domain_name} verification failed")
        return False

    def get_txt_records(self, domain_name):
        """
        Get TXT records for a domain.

        Args:
            domain_name: Domain to query

        Returns:
            list: List of TXT record values
        """
        cache_key = f"dns_txt_{domain_name}"

        # Check cache
        cached = cache.get(cache_key)
        if cached is not None:
            self.logger.debug(f"Using cached DNS results for {domain_name}")
            return cached

        try:
            resolver = dns.resolver.Resolver()
            answers = resolver.resolve(domain_name, 'TXT')

            records = []
            for answer in answers:
                txt_string = answer.to_text().strip('"')
                records.append(txt_string)

            # Cache results
            cache.set(cache_key, records, self.cache_ttl)

            self.logger.debug(
                f"Found {len(records)} TXT records for {domain_name}")
            return records

        except dns.resolver.NXDOMAIN:
            self.logger.warning(f"Domain {domain_name} does not exist")
            return []
        except dns.resolver.NoAnswer:
            self.logger.warning(f"No TXT records found for {domain_name}")
            return []
        except dns.resolver.Timeout:
            self.logger.warning(f"DNS lookup timeout for {domain_name}")
            return []
        except Exception as e:
            self.logger.error(f"DNS lookup failed for {domain_name}: {str(e)}")
            return []

    def get_expected_dns_record(self, verification_token):
        """
        Get expected DNS TXT record value.

        Args:
            verification_token: Token to include in record

        Returns:
            str: Expected DNS TXT record value
        """
        return f"falcon-domain-verification={verification_token}"

    def check_dns_propagation(self, domain_name, verification_token, max_attempts=5, delay_seconds=30):
        """
        Check DNS propagation with retries.

        Args:
            domain_name: Domain to check
            verification_token: Expected token
            max_attempts: Maximum number of attempts
            delay_seconds: Delay between attempts

        Returns:
            dict: Propagation status
        """
        self.logger.info(f"Checking DNS propagation for {domain_name}")

        for attempt in range(1, max_attempts + 1):
            is_valid = self.verify_domain(domain_name, verification_token)

            if is_valid:
                return {
                    'verified': True,
                    'attempts': attempt,
                    'message': f"DNS propagated after {attempt} attempt(s)",
                }

            if attempt < max_attempts:
                import time
                time.sleep(delay_seconds)

        return {
            'verified': False,
            'attempts': max_attempts,
            'message': f"DNS not propagated after {max_attempts} attempts",
        }

    def clear_cache(self, domain_name=None):
        """
        Clear DNS cache.

        Args:
            domain_name: Specific domain to clear (None = clear all)
        """
        if domain_name:
            cache_key = f"dns_txt_{domain_name}"
            cache.delete(cache_key)
            self.logger.debug(f"Cleared DNS cache for {domain_name}")
        else:
            # Clear all DNS cache keys (simplified - would need pattern matching)
            self.logger.debug("Clearing all DNS cache")
            # In production, use cache.delete_pattern if available

    def get_domain_info(self, domain_name):
        """
        Get DNS information for a domain.

        Args:
            domain_name: Domain to query

        Returns:
            dict: DNS information
        """
        txt_records = self.get_txt_records(domain_name)

        return {
            'domain': domain_name,
            'txt_records': txt_records,
            'record_count': len(txt_records),
            'has_falcon_record': any(
                'falcon-domain-verification' in r for r in txt_records
            ),
        }
