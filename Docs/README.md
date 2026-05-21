# Falcon PMS — Documentation Index

Central index for app documentation. Each app follows the same pattern where possible:

| File | Purpose |
|------|---------|
| `implementation_status.md` | Engineering truth — what is built, APIs, real-time, gaps, CIA |
| `pendings.mmd` or `pendings` | Client training narrative (Q&A) + optional Mermaid flows |
| `architecture.md` / `.mmd` | Structure and integration diagrams |

---

## Platform apps

| App | Implementation status | Training / pendings | Architecture |
|-----|----------------------|---------------------|--------------|
| **Accounts** | [Accounts/implementation_status.md](./Accounts/implementation_status.md) | [Accounts/pendings.mmd](./Accounts/pendings.mmd) | [Accounts/architecture.mmd](./Accounts/architecture.mmd) |
| **Config** | [config/pending](./config/pending) | (combined in pending doc) | [config/architecture](./config/architecture) |
| **KPI** | [KPIs/implementation_status.md](./KPIs/implementation_status.md) | [KPIs/pendings](./KPIs/pendings) | [KPIs/architecture.mmd](./KPIs/architecture.mmd) |
| **Dashboard** | [dashboard/implementation_status.md](./dashboard/implementation_status.md) | [dashboard/pendings.mmd](./dashboard/pendings.mmd) | [dashboard/architecture.md](./dashboard/architecture.md) |
| **Tenant** | [Tenant/implementation_status.md](./Tenant/implementation_status.md) | [Tenant/pendings.mmd](./Tenant/pendings.mmd) | — |
| **Structure** | [structure/implementation_status.md](./structure/implementation_status.md) | [structure/pending.md](./structure/pending.md) | [structure/architecture.md](./structure/architecture.md) |
| **Billing** | [billing/implementation_status.md](./billing/implementation_status.md) | — | [billing/architecture.mmd](./billing/architecture.mmd) |

---

## Development

| Doc | Description |
|-----|-------------|
| [Development/guide.md](./Development/guide.md) | Developer onboarding |
| [Development/frontend.md](./Development/frontend.md) | Frontend conventions |
| [Development/pending.md](./Development/pending.md) | Cross-cutting dev backlog |

---

## Stabilization pattern (Accounts / Config / KPI)

1. **Real data** — Reference-data APIs; no hard-coded org/users.  
2. **System settings** — Singleton JSON + version + seed command.  
3. **Real-time** — Channels broadcaster + frontend context.  
4. **CIA** — Register in Config `V1_APP_DEFINITIONS`.  
5. **Docs** — `implementation_status.md` + client `pendings` narrative.

Dashboard and Tenant follow this pattern as of May 2026.

---

## Deployment

| Doc | Description |
|-----|-------------|
| [deployment/production.md](./deployment/production.md) | Production checklist |
| [deployment/docker.md](./deployment/docker.md) | Docker Compose |
| [deployment/nginx.md](./deployment/nginx.md) | Nginx (host + container) |
| [../deploy/README.md](../deploy/README.md) | Scripts, systemd, env template |

## CI/CD

See [.github/workflows/ci-cd.yml](../.github/workflows/ci-cd.yml) and [.github/README.md](../.github/README.md).
