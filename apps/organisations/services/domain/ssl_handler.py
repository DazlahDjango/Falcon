"""
SSL Handler Service - Manages SSL certificates for custom domains
"""

import logging
import ssl
import socket
from datetime import datetime
from apps.organisations.constants import SSLStatus

logger = logging.getLogger(__name__)


class SSLHandlerService:
    """
    Service for handling SSL certificates for custom domains
    """
    
    @classmethod
    def check_certificate_status(cls, domain):
        """
        Check the status of an SSL certificate for a domain
        
        Args:
            domain: Domain instance
        
        Returns:
            dict: Certificate status information
        """
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain.domain_name, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain.domain_name) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Extract certificate details
                    expiry_date = cert.get('notAfter')
                    subject = dict(item[0] for item in cert.get('subject', []))
                    
                    status = {
                        'status': 'active',
                        'expiry_date': expiry_date,
                        'issuer': dict(item[0] for item in cert.get('issuer', [])),
                        'subject': subject,
                        'serial_number': cert.get('serialNumber'),
                        'version': cert.get('version'),
                    }
                    
                    # Calculate days until expiry
                    if expiry_date:
                        expiry_datetime = datetime.strptime(expiry_date, '%b %d %H:%M:%S %Y %Z')
                        days_left = (expiry_datetime - datetime.now()).days
                        status['days_until_expiry'] = days_left
                        
                        # Update domain with SSL info
                        domain.ssl_status = SSLStatus.ACTIVE
                        domain.ssl_expiry_date = expiry_datetime
                        domain.save()
                    
                    logger.info(f"SSL certificate found for {domain.domain_name}, expires: {expiry_date}")
                    return status
                    
        except socket.gaierror:
            logger.error(f"Cannot resolve domain for SSL check: {domain.domain_name}")
            domain.ssl_status = SSLStatus.FAILED
            domain.save()
            return {'status': 'error', 'message': 'Domain cannot be resolved'}
            
        except ConnectionRefusedError:
            logger.error(f"Connection refused for SSL check: {domain.domain_name}")
            domain.ssl_status = SSLStatus.PENDING
            domain.save()
            return {'status': 'pending', 'message': 'Port 443 is not open yet'}
            
        except ssl.SSLCertVerificationError as e:
            logger.error(f"SSL certificate verification failed: {e}")
            domain.ssl_status = SSLStatus.FAILED
            domain.save()
            return {'status': 'invalid', 'message': str(e)}
            
        except TimeoutError:
            logger.error(f"SSL check timeout for: {domain.domain_name}")
            return {'status': 'timeout', 'message': 'Connection timeout'}
            
        except Exception as e:
            logger.error(f"SSL check failed for {domain.domain_name}: {e}")
            return {'status': 'error', 'message': str(e)}
    
    @classmethod
    def get_certificate_details(cls, domain):
        """
        Get detailed certificate information
        """
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain.domain_name, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain.domain_name) as ssock:
                    cert = ssock.getpeercert(True)
                    
                    return {
                        'status': 'success',
                        'certificate': cert.decode('utf-8') if isinstance(cert, bytes) else cert,
                        'cipher': ssock.cipher(),
                        'version': ssock.version(),
                    }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}