## Coniderations
                     INTERNET
                         │
                         ▼
                falconpms.com
                         │
                         ▼
                    NGINX
                 ┌───────┴───────┐
                 │               │
             React          Django/Daphne
                                 │
                    ┌────────────┼───────────┐
                    │            │           │
               PostgreSQL      Redis       Celery

# Overall Architecture
Code
 ↓
Server
 ↓
Python environment
 ↓
Dependencies
 ↓
Environment variables
 ↓
Database
 ↓
Migrations
 ↓
Static files
 ↓
React production build
 ↓
Daphne/Gunicorn
 ↓
Celery
 ↓
Redis
 ↓
Nginx
 ↓
Domain
 ↓
SSL/HTTPS
 ↓
Monitoring
 ↓
Backups

# Database
PostgreSQL version
        +
multiple databases
        +
multiple schemas
        +
roles/users
        +
extensions
        +
connection limits
        +
PgBouncer
        +
backups
        +
PITR
        +
replication
        +
encryption
        +
network isolation

# Enterprise
                  INTERNET
                     │
                     ▼
                Load Balancer
                     │
              ┌──────┴──────┐
              ▼             ▼
          App Server 1   App Server 2
              │             │
              └──────┬──────┘
                     │
              ┌──────┴────────┐
              ▼               ▼
        PostgreSQL          Redis
        Cluster             Cluster
              │
              ▼
         Object Storage
              │
              ▼
          Backups / DR

          *** That's where AWS/Azure/GCP become especially powerful. ***

## Proposed Global
### Enterprise cloud

- Amazon Web Services
- Microsoft Azure
- Google Cloud

### Simpler cloud/VPS

- DigitalOcean
- Hetzner
- Vultr
- Akamai
- OVHcloud

## Proposed Local/Kenya/Africa

- Truehost Cloud
- HostAfrica
- Kenya Website Experts
- HostPinnacle
- Webhost Kenya
- Safaricom