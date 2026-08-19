# Falcon — Application Guide

A reference document listing all backend applications in the Falcon platform, the service modules they contain, and what each module is responsible for.

---

## 1. Accounts

The Accounts app handles everything related to users — who they are, how they log in, what they can do, and how their activity is tracked.

### a. Authentication (`services/auth/`)
- **authentication.py** — Core login logic; verifies user credentials and issues tokens on successful sign-in.
- **jwt.py** — JSON Web Token generation, signing, validation, and refresh handling for stateless auth.
- **session.py** — Session lifecycle management: creating, validating, expiring, and terminating user sessions.
- **password.py** — Password hashing, strength enforcement, reset flows, and expiry policies.
- **mfa.py** — Multi-factor authentication (MFA) setup and verification; supports TOTP and other second-factor methods.
- **mfa_admin_service.py** — Admin-level controls for managing and enforcing MFA policies across users.
- **step_up_service.py** — Step-up authentication for sensitive operations that require re-verification beyond the current session.

### b. Registration (`services/registration/`)
- **user_registration.py** — Standard user sign-up flow; validates input, creates accounts, and triggers onboarding.
- **tenant_registration.py** — Registers a new tenant (organization) in the system alongside its first admin user.
- **invitation.py** — Handles invite-based registration; generates, validates, and processes user invitation links.
- **bulk.py** — Bulk user creation for importing multiple users at once (e.g., from a CSV or admin action).

### c. Authorization (`services/authorization/`)
- **rbac.py** — Role-Based Access Control; assigns roles to users and checks permissions against those roles.
- **permissions.py** — Defines and evaluates specific permission rules for system resources and actions.
- **tenant_access.py** — Enforces that users can only access data and resources belonging to their own tenant.

### d. User Profile (`services/profile/`)
- **profile_manager.py** — Manages user profile data: name, contact details, employment info, and profile updates.
- **preferences.py** — Stores and retrieves per-user preferences such as language, timezone, notifications, and UI settings.
- **avatar.py** — Handles profile picture upload, processing, and storage.

### e. Single Sign-On (`services/sso/`)
- **oauth.py** — OAuth 2.0 integration; allows users to sign in via third-party providers (e.g., Google, Microsoft).
- **saml.py** — SAML 2.0 support for enterprise SSO integrations with identity providers.
- **ldap.py** — LDAP/Active Directory integration for authenticating users against a corporate directory.

### f. Audit (`services/audit/`)
- **logger.py** — Records security-sensitive actions (logins, logouts, password changes, permission escalations) to an audit trail.
- **reporter.py** — Generates audit reports and summaries of user activity for compliance and review purposes.

### g. Policy (`services/policy/`)
- **accounts_policy_service.py** — Enforces account-level policies such as session timeouts, login attempt limits, and password rules.

### h. Real-time (`services/realtime/`)
- **event_broadcaster.py** — Broadcasts account-related events (e.g., login, logout, role change) in real time to connected clients or other services.

### i. Reports (`services/reports.py`)
- Generates user and access reports, aggregating account activity data for admin dashboards and exports.

---

## 2. Tenant

The Tenant app manages the multi-tenant infrastructure of the platform. Each tenant is an isolated organization with its own data, schema, and configuration.

### a. Organization Management (`organization_service.py`)
- Creates, updates, suspends, and deletes tenant organizations. Manages organization-level metadata and status.

### b. Schema Management (`schema_service.py`)
- Handles tenant-specific database schema creation and lifecycle; each tenant gets its own isolated schema in the database.

### c. Connection Management (`connection_service.py`, `connection_cleanup.py`)
- Manages database connections per tenant, including pooling and routing. Cleans up stale or orphaned connections.

### d. Domain Management (`domain_service.py`)
- Associates and verifies custom domains for tenants, enabling white-label deployments under a tenant's own domain.

### e. Provisioning (`provisioning_service.py`)
- Automates the provisioning of a new tenant: sets up their schema, seeds initial data, and configures default settings.

### f. Database Routing (`router_service.py`)
- Routes database queries to the correct tenant schema based on the active request context.

### g. Isolation (`isolation_service.py`)
- Enforces strict data isolation between tenants, ensuring no cross-tenant data leakage at the database or application layer.

### h. Resource Management (`resource_service.py`)
- Tracks and manages per-tenant resources such as storage usage, API limits, and feature entitlements.

### i. Migration (`migration_service.py`)
- Runs and manages database migrations on a per-tenant basis, keeping tenant schemas in sync with the platform version.

### j. Seeder (`seeder_service.py`)
- Seeds tenant databases with default/initial data (e.g., system roles, config templates) on provisioning.

### k. Settings (`settings_service.py`)
- Manages tenant-level configuration settings that override platform defaults.

### l. Stats (`stats_service.py`)
- Collects and exposes tenant usage statistics (e.g., number of users, resource consumption) for monitoring and billing.

### m. Health (`health_service.py`)
- Checks the health status of a tenant's environment, including connectivity and schema integrity.

### n. Real-time (`services/realtime/`)
- Publishes real-time events related to tenant lifecycle changes (e.g., provisioning complete, schema updated).

---

## 3. Billing

The Billing app manages all financial operations of the platform, from subscriptions and payments to invoicing and usage tracking.

### a. Subscription Management (`services/subscription/`)
- **lifecycle.py** — Controls the full subscription lifecycle: activation, suspension, and cancellation.
- **plan_management.py** — Manages available plans and assigns or changes a tenant's current plan.
- **renewal.py** — Handles subscription renewals, both automatic and manual.
- **upgrade_downgrade.py** — Processes plan changes; handles proration and effective-date calculations.
- **trial.py** — Manages free trial periods: starting trials, tracking duration, and converting to paid.
- **grace_period.py** — Grants a grace period after failed payment before suspending a subscription.
- **dunning_service.py** — Automates payment retry communications (dunning emails/actions) for failed payments.
- **enterprise_override.py** — Applies manual overrides for enterprise customers with custom commercial terms.

### b. Payment Processing (`services/payment/`)
- **paystack_provider.py** — Integration with Paystack as the primary payment gateway.
- **interface.py** — Abstract payment interface, allowing multiple payment providers to be supported.
- **retry.py** — Handles failed payment retries with configurable backoff strategies.

### c. Paystack Integration (`services/paystack/`)
- **client.py** — Low-level HTTP client for communicating with the Paystack API.
- **webhook_handler.py** — Processes incoming Paystack webhook events (e.g., payment success, charge failure).
- **signature.py** — Validates webhook signatures to verify event authenticity.
- **verification.py** — Verifies payment statuses directly against Paystack for reconciliation.

### d. Invoicing & Billing Documents (`services/billing/`)
- **invoice.py** — Generates and manages invoices for each billing cycle.
- **checkout.py** — Handles the checkout flow when a tenant initiates or changes a payment method.
- **tax.py** — Calculates and applies applicable taxes to billing amounts.

### e. Webhook Processing (`services/webhook/`)
- **processor.py** — Central processor that receives, routes, and dispatches incoming payment gateway webhook events.

### f. Usage Tracking (`services/usage/`)
- **service.py** — Tracks metered usage (e.g., API calls, active users, storage) against plan limits for billing purposes.

### g. Audit (`services/audit/`)
- Logs all billing-related events (payments, refunds, plan changes) for financial audit trails.

### h. Settings (`services/settings/`)
- Manages billing configuration such as currency, billing cycle dates, and payment method preferences.

### i. Infrastructure (`circuit_breaker.py`, `decorators.py`)
- **circuit_breaker.py** — Prevents cascading failures when an external payment provider is unavailable.
- **decorators.py** — Shared utility decorators used across billing services (e.g., retry logic, audit logging wrappers).

---

## 4. KPI

The KPI app is the core performance management engine. It manages KPI definitions, target-setting, actual value recording, calculations, and reporting.

### a. KPI Management (`kpi.py`)
- Creates, updates, and manages KPI definitions including their type, formula, frequency, and ownership.

### b. Target Management (`target.py`)
- Sets and manages performance targets for each KPI, broken down by period, employee, or organizational unit.

### c. Actual Values (`actual.py`)
- Records and manages actual performance values submitted against KPI targets for a given period.

### d. Calculation Engine (`calculation.py`)
- Computes KPI scores by applying formulas, weights, and normalization rules to actual values against targets.

### e. Validation (`validation.py`, `validator.py`)
- Validates KPI data submissions and configurations to ensure completeness, correctness, and policy compliance.

### f. Cascade (`cascade.py`)
- Handles KPI cascading — the process of pushing organizational-level KPIs down to teams and individuals.

### g. Sync (`sync.py`)
- Synchronizes KPI data across related entities (e.g., when a parent KPI changes, cascaded KPIs are updated accordingly).

### h. Analytics (`services/analytics/`)
- **live_analytics.py** — Provides real-time KPI performance analytics and live score updates.

### i. Notifications (`notifications.py`)
- Sends alerts and notifications when KPIs hit thresholds, deadlines approach, or submissions are pending.

### j. Dashboard (`dashboard.py`)
- Aggregates KPI data for dashboard views: scores, trends, completion rates, and team-level summaries.

### k. Reporting (`report.py`, `report_catalog.py`)
- Generates detailed KPI performance reports and maintains a catalog of available report types.

### l. Audit (`audit.py`)
- Logs all KPI changes, submissions, and approvals for traceability and compliance purposes.

### m. Settings (`services/settings/`)
- **kpi_settings_service.py** — Manages KPI module configuration such as scoring scales, periods, and submission windows.

### n. Real-time (`services/realtime/`)
- Broadcasts live KPI updates and events to connected dashboards and users.

---

## 5. Structure

The Structure app manages the organizational chart (org chart) — departments, positions, reporting lines, and the hierarchy of the organization.

### a. Position Management (`position.py`)
- Creates and manages positions (job roles) within the org chart, including their level, department, and assignment.

### b. Hierarchy (`services/hierarchy/`)
- **tree_builder.py** — Builds the full organizational tree structure from raw position/department data.
- **path_resolver.py** — Resolves the reporting path between any two positions in the hierarchy.
- **subtree_extractor.py** — Extracts a subtree of the org chart rooted at a given node (e.g., a department).
- **lca_finder.py** — Finds the Lowest Common Ancestor of two nodes in the hierarchy (useful for scope calculations).
- **cycle_detector.py** — Detects circular reporting relationships that would corrupt the org tree.
- **org_validator.py** — Validates the overall integrity of the organizational structure.

### c. Reporting Lines (`services/reporting/`)
- **chain_service.py** — Manages the chain of command (reporting chain) between positions.
- **delegation_service.py** — Handles authority delegation when a manager delegates reporting responsibilities.
- **interim_manager.py** — Manages interim manager assignments when a position is vacant.
- **span_of_control.py** — Calculates and enforces span-of-control policies (max/min direct reports per manager).
- **chain_validator.py** — Validates reporting chains for correctness and policy compliance.

### d. Security & Access (`services/security/`)
- **hierarchy_access.py** — Enforces access control based on org hierarchy position (e.g., managers can see their subtree).
- **scope_enforcer.py** — Restricts data access to the authorized scope of a user's position.
- **data_firewall.py** — Prevents unauthorized cross-hierarchy data access.
- **sensitivity_classifier.py** — Classifies positions or data by sensitivity level for access control purposes.

### e. Validation (`services/validation/`)
- **org_validator.py** — Validates org chart integrity rules before committing changes.
- **headcount_validator.py** — Enforces headcount limits per department or position.
- **budget_validator.py** — Validates that structural changes comply with defined budget constraints.
- **max_depth_validator.py** — Enforces limits on the maximum depth of the organizational hierarchy.

### f. Export (`services/export/`)
- **org_chart_generator.py** — Generates visual org chart representations.
- **csv_exporter.py** — Exports org chart and position data to CSV format.
- **json_exporter.py** — Exports structure data in JSON format for integration with other systems.
- **visio_exporter.py** — Exports the org chart in Microsoft Visio-compatible format.

### g. Sync (`services/sync/`)
- **event_publisher.py** — Publishes structure change events to other apps when the org chart is updated.
- **index_rebuilder.py** — Rebuilds search indexes after significant structural changes.
- **cache_warmer.py** — Pre-populates caches with hierarchy data to speed up queries.
- **view_refresher.py** — Refreshes materialized views that summarize org chart data.

### h. Audit (`services/audit/`)
- Logs all structural changes (position creations, reporting line changes, deletions) for HR and compliance records.

### i. Settings (`services/settings/`)
- Manages structure-level configuration, such as hierarchy depth limits and headcount policies.

### j. Real-time (`services/realtime/`)
- Broadcasts live org chart updates to connected users when structure changes are made.

---

## 6. Report Platform (`reportplt`)

The Report Platform app is a cross-cutting reporting engine that generates, schedules, and delivers reports sourced from across all other apps in the platform.

### a. Report Generation (`services/generation/`)
- **report_generator.py** — The core engine that builds complete reports by composing data, formatting, and layout.
- **data_aggregator.py** — Aggregates and summarizes raw data from multiple sources into report-ready datasets.
- **query_builder.py** — Constructs dynamic queries to extract data for report generation.
- **chart_renderer.py** — Renders visual charts and graphs for inclusion in reports.
- **pivot_builder.py** — Builds pivot table structures from raw data for multi-dimensional analysis.

### b. Data Extraction (`services/extraction/`)
- **kpi_extractor.py** — Pulls KPI data for use in cross-platform reports.
- **reviews_extractor.py** — Pulls performance review data for reporting.
- **structure_extractor.py** — Pulls org structure data for org-level reports.
- Supports both production and system data extraction modes.

### c. Analytics (`services/analytics/`)
- **performance_analyzer.py** — Analyzes performance trends across KPIs and reviews.
- **trend_analyzer.py** — Identifies and visualizes trends over time across metrics.
- **comparative_analyzer.py** — Compares performance across teams, periods, or benchmarks.
- **predictive_analyzer.py** — Applies predictive models to forecast future performance.
- **anomaly_detector.py** — Flags statistical anomalies in reported data.

### d. Export (`services/export/`)
- **pdf_exporter.py** — Exports reports to PDF format.
- **excel_exporter.py** — Exports reports to Excel spreadsheets.
- **csv_exporter.py** — Exports report data to CSV format.
- **json_exporter.py** — Exports report data in JSON format for API consumers.
- **powerpoint_exporter.py** — Exports reports as PowerPoint presentations.
- **export_factory.py** — Factory that determines the correct exporter based on requested format.

### e. Scheduling (`services/scheduler/`)
- **schedule_manager.py** — Manages scheduled report runs: creating, updating, and removing report schedules.
- **scheduler_runner.py** — Executes scheduled report jobs at the configured times.
- **delivery_service.py** — Delivers generated reports to recipients via email or other channels.
- **retry_handler.py** — Retries failed report deliveries.

### f. Templates (`services/templates/`)
- **template_manager.py** — Manages report templates: creating, versioning, and assigning templates to report types.
- **prebuilt_templates.py** — Ships a library of ready-made report templates covering common use cases.

### g. Dashboard (`services/dashboard/`)
- Powers the reporting dashboard with aggregated metrics and report status views.

### h. Filters (`services/filters/`)
- Provides filtering utilities that allow users to scope report data by date, department, employee, and other dimensions.

### i. Rendering (`services/rendering/`)
- Handles the final rendering step, converting generated report data into the visual/document output format.

### j. Security (`services/security/`)
- Controls access to reports based on user roles, ensuring users only receive data within their authorized scope.

### k. Orchestrator (`orchestrator.py`)
- Coordinates the end-to-end report pipeline: extraction → analytics → generation → rendering → export → delivery.

---

## 7. Reviews

The Reviews app manages the performance review (appraisal) process from end to end — review cycles, assessments, ratings, calibration, and outcomes.

### a. Review Cycles (`services/cycle/`)
- **cycle_service.py** — Creates and manages performance review cycles (annual, mid-year, quarterly), including their scheduling and status.

### b. Assessment (`services/assessment/`)
- **self_assessment_service.py** — Manages the self-assessment phase where employees evaluate their own performance.
- **supervisor_review_service.py** — Manages the supervisor review phase where managers assess their direct reports.
- **final_rating_service.py** — Consolidates self-assessment and supervisor scores into a final performance rating.

### c. Rating & Scoring (`services/rating/`)
- **score_calculator.py** — Calculates numeric performance scores from rating inputs.
- **rating_converter.py** — Converts raw scores into defined rating categories (e.g., Excellent, Meets Expectations, Needs Improvement).
- **coefficient_applicator.py** — Applies weighting coefficients to different components of the review score.

### d. Aggregation (`services/aggregation/`)
- **kpi_aggregator.py** — Aggregates KPI scores into the overall performance rating within a review.
- **competency_aggregator.py** — Aggregates competency-based assessment scores into the overall review rating.

### e. Calibration (`services/calibration/`)
- **calibration_service.py** — Manages calibration sessions where managers align ratings across teams for fairness.
- **outlier_detector.py** — Identifies statistically outlying ratings that may indicate inconsistency or bias.

### f. Feedback (`services/feedback/`)
- **feedback_service.py** — Collects and stores qualitative feedback submitted during the review process.
- **summary_service.py** — Generates narrative summaries of feedback for inclusion in review documents.

### g. Performance Improvement Plan (`services/pip/`)
- **pip_service.py** — Creates and manages Performance Improvement Plans for underperforming employees.
- **pip_generator.py** — Auto-generates PIP documents based on review outcomes and defined templates.
- **pip_tracker.py** — Tracks progress against PIP milestones and flags completion or failure.

### h. Promotion (`services/promotion/`)
- **promotion_service.py** — Manages promotion recommendations that arise from review outcomes.

### i. Availability (`services/availability/`)
- Manages participant availability and scheduling windows within the review process.

### j. Reporting (`services/reporting/`)
- Generates review-level reports: completion rates, score distributions, team summaries, and calibration outputs.

### k. Analytics (`services/analytics/`)
- Analyzes review data to surface performance trends, rating distributions, and team-level patterns.

### l. Audit (`services/audit/`)
- Logs all review actions (submissions, edits, approvals, calibration changes) for traceability and compliance.

### m. Notification (`services/notification/`)
- Sends notifications to participants at key review milestones (e.g., cycle opens, review due, review complete).

### n. Dashboard (`services/dashboard/`)
- Aggregates review data for the manager and HR dashboard: completion status, scores, pending actions.

### o. Security (`services/security/`)
- Ensures review data is only visible to authorized participants (reviewee, reviewer, HR, authorized managers).

### p. Settings (`services/settings/`)
- Manages review module configuration: scoring scales, competency frameworks, review form templates, and cycle defaults.

### q. Sync (`services/sync/`)
- Synchronizes review data with other apps (e.g., KPI scores fed into reviews, structure changes reflected in reviewer assignments).

### r. Real-time (`services/realtime/`)
- Broadcasts live review status updates to connected participants.

---

## 8. Configs

The Configs app handles platform-wide configuration management, system health monitoring, backup and restore operations, and disaster recovery.

### a. Registry (`services/registry/`)
- **app_registry.py** — Central registry of all apps in the platform and their configurations.
- **app_definitions.py** — Defines the configuration schema and default settings for each registered app.
- **dependency_resolver.py** — Resolves configuration dependencies between apps to ensure correct initialization order.
- **recovery_order.py** — Defines the order in which apps should be recovered during a disaster recovery event.

### b. Backup (`services/backup/`)
- **backup_orchestrator.py** — Coordinates the full backup process across all apps and databases.
- **database_dump_service.py** — Performs raw database dumps as part of the backup process.
- **backup_storage.py** — Manages where backups are stored (local, cloud, remote).
- **backup_strategy.py** — Defines backup strategies (full, incremental, differential) and their schedules.
- **backup_scheduler.py** — Schedules automated backup jobs.
- **backup_compressor.py** — Compresses backup files to reduce storage footprint.
- **backup_encryptor.py** — Encrypts backup files for security compliance.
- **backup_retention.py** — Enforces retention policies, automatically purging backups older than the configured period.
- **backup_verification.py** — Verifies backup integrity after creation to ensure restorability.
- **single_app_backup.py** — Performs targeted backups of a single app's data.
- **multi_app_backup.py** — Coordinates simultaneous backups across multiple apps.

### c. Restore (`services/restore/`)
- Handles restoration of data from backups, including full and partial restores.

### d. Disaster Recovery (`services/disaster_recovery/`)
- **dr_orchestrator.py** — Coordinates the overall disaster recovery process.
- **dr_plan_executor.py** — Executes a pre-defined disaster recovery plan step by step.
- **failover.py** — Switches platform traffic to a standby environment in the event of a primary failure.
- **failback.py** — Restores platform operation back to the primary environment after a failover.
- **dr_drill.py** — Simulates disaster recovery scenarios to test and validate recovery plans.
- **dr_metrics.py** — Collects and reports metrics from DR events and drills (RTO, RPO, success rate).

### e. Health Monitoring (`services/health/`)
- **health_checker.py** — Checks the health status of system components and services.
- **metric_collector.py** — Collects system-level metrics (CPU, memory, DB connections, queue depth) for monitoring.
- **threshold_evaluator.py** — Evaluates collected metrics against defined thresholds and triggers alerts.
- **conditional_trigger.py** — Fires automated actions (e.g., scale up, alert, failover) when health thresholds are breached.

### f. Scheduling (`services/scheduling/`)
- **schedule_executor.py** — Executes scheduled maintenance and operational tasks.
- **cron_parser.py** — Parses cron expressions for scheduling configuration.
- **priority_engine.py** — Determines the priority of competing scheduled tasks.
- **conflict_detector.py** — Detects and resolves scheduling conflicts between tasks.
- **calendar_manager.py** — Manages scheduled task calendars and blackout periods.

### g. Maintenance (`services/maintenance/`)
- Handles planned maintenance windows, including service pause/resume and maintenance-mode notifications.

### h. Security (`services/security/`)
- Manages security-related configuration such as encryption key management and security policy enforcement at the platform level.

### i. Settings (`services/settings/`)
- Central management of platform-wide settings that affect all apps globally.

### j. Real-time (`services/realtime/`)
- Broadcasts system health status and config change events in real time to admin dashboards.

---

*Document generated from the Falcon platform codebase — `apps/` services layer.*
