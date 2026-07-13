# Intro
Good morning, I'm glad having you to help me today with something here on tenants app, we'll be going module by module today, I have several modules/elements in tenant.
And today we're working on the provision module
For the other module I've tried also to achieve enterprise level as required for:
schema in error.md
connection in error_frd.md
resources in err.md and now we're in provision

## Task 1:

# To-Do List
1. you need to read all the files for tenant app from models init and the services init, those are the main primary files, one being database the other one being the business logic then fiocus only to provision module and nothing else maybe with the organization/tenant/the new client classes the primary Organization class for tenant management cause from my understanding the provision need to help in the organization management, creation etc
2. I want you to focus deeep in this provison module very deeply and make it perfect, secured, solid, compatible, standard with the CIA Traid implementation if needed
I know I might be forgeting other things or the ones that I've listed there can be duplicate but you can help me prevent it

    - My research on provision
🏗️ Enterprise-Grade Provisioning Module - Complete Checklist
Current Score: 5.5/10 (Functional but NOT Enterprise Ready)
📋 Enterprise Provisioning Checklist
1. Idempotency & Duplicate Protection 🔴 CRITICAL
Check if already provisioned before running

Check if schema exists before creating

Check if resources exist before creating

Use database locks to prevent race conditions

2. Rollback on Failure 🔴 CRITICAL
Atomic transactions for ALL operations

Cleanup on failure - delete schema if resources fail

Compensation logic - revert what was created

3. Progress Tracking 🟡 HIGH
Track provisioning status (PENDING, RUNNING, COMPLETED, FAILED)

Store step-by-step progress for debugging

Show progress to user via WebSocket or polling

4. Validation 🟡 HIGH
Validate organization data before provisioning

Validate subscription tier and limits

Check if organization name is valid for schema

5. Async with Real-time Updates 🟡 HIGH
Celery task with progress updates

WebSocket for real-time progress

Retry logic for failed tasks

6. Custom Resource Limits 🟡 HIGH
Per-organization resource overrides

Subscription tier-based limits

Burst limits for temporary spikes

7. Audit Logging 🟡 HIGH
Log who provisioned what and when

Track all provisioning steps

Store errors and retries

8. Grace Period / Trial Support 🟢 MEDIUM (I think the resources module and the billing app handles this)
Trial period with limited features

Automatic expiry after trial ends

Graceful degradation after trial

9. Template-Based Provisioning 🟢 MEDIUM
Provisioning templates (default, premium, enterprise)

Customizable templates per organization

Clone existing organization configuration

10. Health Checks 🟢 MEDIUM (handled by the configs app)
Verify schema exists after provisioning

Verify resources created correctly

Verify data seeded properly

11. Notifications 🟢 MEDIUM
Email notification when provisioning completes

Admin alert on provisioning failure

Slack/Teams integration for monitoring

12. Rollback Capability 🟢 MEDIUM
Delete schema if provisioning fails

Mark organization as failed

Admin tool to retry failed provisions

13. Performance Optimization 🟢 MEDIUM
Batch create resources (bulk insert)

Parallel schema creation where possible

Database connection pooling for provisioning

14. Multi-Region Support ⚪ LOW
Provision in specific region based on organization

Geographic data isolation

Backup replicas

15. Disaster Recovery ⚪ LOW (the configs app handles this)
Backup before provisioning

Restore from backup on failure

Point-in-time recovery

# Why Provisioning Must Be Part of organization Creation
Every organization that is created MUST be provisioned. Without provisioning, the organization is just a database record with no actual infrastructure to work with.

Without Provisioning:
Organization Created ❌
├── No database schema ❌
├── No resources ❌
├── No default data ❌
├── No settings ❌
└── Organization is USELESS ❌

With Provisioning:
Organization Created ✅
├── Database schema created ✅
├── Resources created ✅
├── Default data seeded ✅
├── Settings configured ✅
└── Organization is READY ✅

NOTE:
1. I don't want you to test or run any test on the agent session just make sure my file is clean, no offence but I trust you, you don't have to run the tests and test files on the terminal lets start
2. I changed my tenant app completely in a way that you'll find some files that I'm not using like now I have the services/provisioning/ directory files whcih I was using earlier and now I have the provisioning_service.py file which is the new file

## Task 2 (It'll be in progress when you're done with the provision backend)
We're now done with task one
1. Here we now need to see if the tenant/organization creation and some management imports and uses the provision very well
2. We need to add some provision APIs(Views) if needed for monitoring and other things that you might think of
But the critical one is to standadize the organization management with the provision services

## Task 3:
We're done with the second task and the first task, we need to move to frontend now, we've edited some files for the organization and implemented full enterprise provisioning module
Next is to upgrade and edit frontend files for the Provision which it turns out I don't have them you can just use a refrence file from any of the tenant app file
now let's get to read some files here:
config/constants/tenantApiConstants(this is where we'll add the new API endpoints for provisioning)
services/tenant/provisioning.service( we'll create this new file for the provision APIs, you can check the other tenant services files to use them as reference)
store/tenant/slice/provision.slice(Also we create this one for the provision, it imports now the services)
store/tenant/selectors/provision.selector(Also we create this one for the provision)
hooks/tenant/useProvision(This too has to be created)
its components in components/tenant/provision/ directory then create there the files together with the css files:
pages/tenant/Provision
an add them in routes/tenant.routes.jsx