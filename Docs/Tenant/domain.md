# Falcon Tenant Domain Module Documentation

---

## 1. Executive Summary & Module Overview

The **Domain Module** is the edge-routing and identity layer of the **Falcon Multi-Tenant Platform**. It connects client web requests (custom domain names or subdomains) directly to their respective isolated database schemas, enforces domain ownership verification, and manages automated SSL/TLS certificate lifecycles.

### Primary Functions:
1. **Multi-Tenant Request Routing**: Maps incoming HTTP requests by hostname to the tenant's isolated PostgreSQL database schema.
2. **Enterprise Custom Branding (White-Labeling)**: Enables enterprise clients to run Falcon under their own domain names (e.g., `https://performance.safaricom.co.ke`).
3. **Automated Domain Ownership Verification**: Validates domain ownership via DNS TXT records or HTTP challenges before unblocking traffic.
4. **Automated SSL/TLS Lifecycle Management**: Issues cryptographic X.509 certificates, tracks 90-day expiration windows, and alerts before certificate expiry.
5. **System URL & Email Link Canonicalization**: Serves as the primary source of truth for generating secure system links (user invitations, password resets, review notifications).

---

## 2. Multi-Tenant Request Routing Architecture

When a client or API consumer accesses Falcon, the request flows through the **Organization Resolution Middleware** to determine tenant context.

### Request Flow Diagram:
```text
  Client HTTP Request (e.g., https://www.falconigc.co.ke/api/v1/dashboard/)
                                   │
                                   ▼
                   [ OrganizationResolutionMiddleware ]
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
  1. Check Header             2. Check Subdomain          3. Check Custom Domain
  (X-Tenant-ID)               (*.falcon.com)              (OrganizationDomain)
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                     Query: Status == 'ACTIVE'
                                   │
                                   ▼
                 Identifies Tenant: Airtel (ID: c732f915-...)
                                   │
                                   ▼
        Switches PostgreSQL Search Path -> 'c732f915_schema'
```

### Resolution Priority:
1. **HTTP Headers**: Explicit `X-Tenant-ID` or `X-Organization-ID` headers (useful for internal microservices & mobile apps).
2. **Subdomain Matching**: Standard tenant subdomains (e.g., `company.falcon.com`).
3. **Custom Domain Lookup**: Queries `OrganizationDomain` database table for an `ACTIVE` matching hostname.

---

## 3. Automatic Domain Registration on Tenant Onboarding

When a new organization is created:
1. **Website URL Parsing**: The system automatically extracts a clean domain hostname from the optional `website` field (e.g., `https://safari-tech.co.ke` -> `safari-tech.co.ke`).
2. **Auto-Registration**: An `OrganizationDomain` record is created with `is_primary = True` and initial status `PENDING`.
3. **Signal Dispatch**: A post-save signal immediately triggers background verification without delaying HTTP response times.

---

## 4. Domain Ownership Verification Lifecycle (Security Protocol)

To prevent **Domain Hijacking** (where Tenant B attempts to claim Tenant A's domain), Falcon requires domain verification before activating routing.

### State Transition Machine:
```text
  [ PENDING ] ───> [ VERIFYING ] ───┬───> [ ACTIVE ] (Verified & SSL Issued)
                                     │
                                     └───> [ FAILED ] (Logs DNS/HTTP Error)
```

### Verification Methods:

#### Method A: DNS TXT Record (Production Standard)
- Falcon generates a 128-bit random UUID token: `verification_token`.
- The domain owner adds a `TXT` record at their domain registrar:
  - **Record Type**: `TXT`
  - **Host / Name**: `@` or `www`
  - **Value**: `falcon-domain-verification=<verification_token_hex>`
- Falcon resolves public DNS records. If the TXT token matches, status updates to `ACTIVE`.

#### Method B: HTTP Challenge Probe (Fallback / Development)
- If DNS resolution fails, Falcon probes:
  - `https://<domain>/.well-known/falcon-verification.txt`
  - `http://<domain>/.well-known/falcon-verification.txt`
  - `{BASE_URL}/.well-known/falcon-verification.txt?domain=<domain>`
- On matching token content, status updates to `ACTIVE`.

---

## 5. SSL/TLS Certificate Lifecycle Management

Once a domain reaches `ACTIVE` status, Falcon automatically provisions SSL metadata.

### Certificate Generation Process:
1. **RSA Key Generation**: Generates a 2048-bit RSA private key.
2. **X.509 Structure**: Constructs a standard X.509 V3 certificate containing:
   - **Common Name (CN)**: `domain.domain`
   - **Subject Alternative Name (SAN)**: `DNSName(domain.domain)`
   - **Validity Window**: 90 Days from issuance.
   - **Signature**: SHA-256 (`hashes.SHA256()`).
3. **PEM Storage & Serialization**: Converts the certificate into standard PEM text format (`-----BEGIN CERTIFICATE-----`), calculating SHA-256 fingerprints and storing them in domain metadata.
4. **Expiration Monitoring**: Background jobs track `ssl_expires_at` and trigger renewal notifications 30 days prior to expiration.

---

## 6. CIA Triad Security Guarantees

| Security Pillar | Implementation Guarantee |
| :--- | :--- |
| **Confidentiality** | Strict tenant database isolation. Unverified or failed domains cannot route traffic or expose data. |
| **Integrity** | Anti-spoofing verification ensures only verified owners of a domain can link it to their tenant account. |
| **Availability** | Asynchronous Celery task processing ensures verification probes never block HTTP web server threads. |

---

## 7. Operations & Administration Tooling

### CLI Management Commands

#### 1. Domain Ownership Verification (`verify_domains`)
Administrators can run batch DNS/HTTP verifications or reset failed domain statuses:
```bash
# Verify all pending domains (runs DNS TXT check + HTTP challenge fallback)
python manage.py verify_domains --all-pending --user-email admin@falcontech.com

# Force re-check of all failed domains
python manage.py verify_domains --all-failed --force --user-email admin@falcontech.com

# Target a specific domain by UUID or hostname
python manage.py verify_domains --domain-id www.falconigc.co.ke --force
```

#### 2. SSL/TLS Certificate Renewal (`renew_ssl_certificates`)
Administrators can inspect and renew X.509 certificates approaching expiration:
```bash
# Renew all SSL certificates expiring within the default 30-day window
python manage.py renew_ssl_certificates --all-expiring

# Custom threshold window (e.g., check certificates expiring within 15 days)
python manage.py renew_ssl_certificates --all-expiring --days 15

# Force renew a specific domain's SSL certificate immediately
python manage.py renew_ssl_certificates --domain-id www.falconigc.co.ke --force
```

### Real-Time WebSocket Progress Monitoring
Frontend clients can connect to WebSocket channel group `org_{org_id}_domain_verification` to receive real-time updates during domain verification (`verification_started`, `dns_check`, `ssl_issuance`, `verification_completed`, `verification_failed`).
