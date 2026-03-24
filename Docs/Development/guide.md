# FALCON PMS DEVELOPMENT GUIDE
Building the Performance Management System Step by Step

# Introduction

This guide walks you through building Falcon PMS, starting from the foundation and moving outward. We follow the principle of least dependencies first—building apps that don't rely on others before building those that do.

# The development order is:

    Core — The foundation (models, mixins, utilities)

    Accounts — User authentication and roles

    Tenant — Multi-tenancy and client management

    Structure — Departments and reporting hierarchy

    KPI — The heart of the system

    Workflows — Validation and approval processes

    Dashboard — Hierarchical views and drill-down

    Reviews — Performance appraisals and PIPs

    Mission — Status reports

    Tasks — Dependencies and task management

    Reports — Analytics and exports

    Notifications — Communication engine

Each section covers the purpose of the app, its key models, services, and how it connects to the frontend.

# PHASE 1: Core App
# Purpose
    The Core app is the foundation upon which everything else is built. It contains no business logic of its own but provides the building blocks that every other app will use. Think of it as the toolbox that every worker on the construction site will need.

# WHAT IT CONTAINS
# Abstract Base Models
    These are templates for creating other models. They ensure consistency across the entire system. You create one base model with timestamps, and every other model inherits it automatically.

# The TenantAwareModel
    is particularly important—it ensures that every piece of data in the system is tagged with which organization it belongs to. This is the foundation of your multi-tenancy.

# The SoftDeleteModel
    allows records to be hidden rather than permanently deleted, which is crucial for audit trails and data recovery.

# Managers
    These control how data is retrieved from the database. The TenantAwareManager automatically filters queries so users only see data from their own organization. Supervisors see their team's data. Staff only see their own.

# Constants
    These are centralized definitions for things like sector types (commercial, NGO, public), KPI types (count, percentage, financial), and system roles. Keeping these in one place means changing a value doesn't require hunting through hundreds of files.

# Exceptions
    Custom error classes that make debugging easier. When something goes wrong, you'll know exactly whether it's a tenant issue, a security issue, or a business logic issue.

# Utilities
    Helper functions for caching, validation, and date handling that will be used across the system.

# DEVELOPMENT STEPS

Begin by creating the abstract base models. Write the TimestampedModel, UUIDModel, and SoftDeleteModel first. Test that they work correctly on a simple model before moving on.

Next, implement the TenantAwareModel and its companion TenantAwareManager. This is critical—test tenant isolation thoroughly by creating two test tenants and verifying that data from one never leaks to the other.

Add the constants. These are simple but important—define your sector types, KPI types, and role names here.

Finally, create the exception classes and utilities as you need them during development of other apps.

# How It Connects to Frontend
The Core app has no direct frontend components. It provides the backend foundation that all other apps build upon. The frontend will interact with the features built in subsequent apps, which in turn rely on Core's base classes.

# PHASE 2: Accounts App
# Purpose
    The Accounts app manages everything about users—who they are, how they log in, what they can do, and who they report to. It is intentionally built early because every other app depends on knowing who the current user is and what permissions they have.

# What It Contains
# User Model
    This is the central piece. It stores email (used as username), name, role, tenant association, and a link to their supervisor. You extend Django's built-in user model rather than replacing it.

    The user model also tracks last login, password change dates, and whether the account is active. It includes methods like get_direct_reports() and has_role() that other apps will call constantly.

# Role and Permission Models
    These define what different users can do. The roles from your proposal—Super Admin, Client Admin, Dashboard Champion, Executive, Line Manager, Staff, and Read-Only—are defined here.

    Rather than hardcoding permissions, you create a flexible system where each role has a set of permissions. A permission might be "can_approve_kpi_data" or "can_view_team_dashboard."

# Profile Model
    Stores additional user information like phone number, department, avatar image, and job title. This is a separate model linked to User by a one-to-one relationship.

# MFA Model
    Handles multi-factor authentication. Stores TOTP secrets, backup codes, and which devices the user has registered.

# Authentication Services
    These are the business logic for logging in, registering, and managing sessions. The auth service handles password validation, token generation, and session tracking. The MFA service handles verifying one-time passwords and generating backup codes.

    The permissions service provides a clean interface for checking if a user has a specific permission, whether directly or through their role.

# API Endpoints
    The API exposes endpoints for login, logout, password reset, and user management. The login endpoint returns JWT tokens. The users endpoint allows administrators to create, update, and list users. The roles endpoint manages role assignments.

    All endpoints use appropriate permissions—regular users can only see and edit their own profile; administrators can manage all users in their tenant.

# Development Steps
Start with the User model. Get it working with basic fields—email, name, tenant, and a simple role field. Test creating users and authenticating.

Next, implement the more sophisticated Role and Permission system. Create your roles from the proposal and assign basic permissions to each.

Add the Profile model and link it to User. Test that creating a user automatically creates their profile.

Build the authentication services. Implement password hashing, token generation, and login validation. Test with actual requests.

Implement the MFA system. This can be added later if you want to launch without it, but design the models now so integration is easier later.

Create the API endpoints. Start with login and registration, then add user management endpoints. Test each endpoint with different roles to ensure permissions work correctly.

How It Connects to Frontend
The frontend login page calls the auth endpoint and stores the returned JWT token. Every subsequent API request includes this token in the Authorization header.

The user profile page fetches data from the users endpoint and displays it. Admin users see a user management interface that lists all users in their tenant, with forms to create, edit, and deactivate accounts.

The role management screen allows Client Admins to assign roles to users. The Dashboard Champion role, for example, is assigned here.

The MFA setup screen guides users through registering their authenticator app and saving backup codes.

# PHASE 3: Tenant App/Organization
# Purpose
The Tenant app manages the organizations that use Falcon PMS. It handles client registration, subscription plans, and tenant-specific configuration. This app is built after Accounts because users need to belong to tenants, but tenants need to be created before users can be added.

# What It Contains
# Client Model
    Represents an organization using the system. Stores the organization name, sector type (commercial, NGO, public, consulting), contact information, and billing details.

    Each client gets a unique subdomain or custom domain. The model stores the domain name and a unique slug used in URLs.

# Subscription Model
    Tracks what plan a client is on (Basic, Professional, Enterprise), when their subscription starts and ends, and what features are enabled for them.

    This model also stores payment status—whether the subscription is active, expired, or in trial.

# Domain Model
    Handles custom domains. Clients can use your system on your domain (falcon.com/clientname) or their own domain (pms.client.com). This model stores the domain name, SSL certificate status, and verification records.

# Settings Model
    Stores tenant-specific configuration like whether they use quarterly or annual reviews, what their default rating scale is, and which optional modules they have enabled.

# Provisioning Service
    This service handles the process of setting up a new tenant. When a client signs up, this service creates the tenant record, generates their subdomain, sets up database schemas, and sends welcome emails.

# Billing Service
    Integrates with Stripe or another payment processor. Handles subscription creation, payment processing, invoice generation, and renewal notifications.

# Development Steps
Create the Client model first. Get the basic fields working and test creating tenants.

Add the Subscription model and link it to Client. Test creating subscriptions and checking whether they are active.

Implement the Settings model. Test that different tenants can have different settings and that these settings are properly isolated.

Build the provisioning service. This is a background task (using Celery) that runs when a new client signs up. Test it thoroughly—provisioning should be reliable and idempotent.

Implement the billing integration. Start with Stripe's test mode and simulate successful and failed payments.

Create the API endpoints for tenant management. Super Admins should be able to list, create, and manage all tenants. Client Admins should be able to view and update their own tenant settings.

How It Connects to Frontend
The signup page collects organization information and calls the tenant creation endpoint. After signup, the user is redirected to their new subdomain.

The admin interface includes a tenant management section where Super Admins can view all clients, manage subscriptions, and troubleshoot issues.

Client Admins see a settings page where they can configure their organization's branding (logo, colors), review cycles, and feature preferences.

The subscription management screen shows the current plan, usage statistics, and a billing history. It includes an interface for upgrading or downgrading plans.

Phase 4: Structure App
Purpose
The Structure app defines how an organization is organized—departments, teams, and reporting relationships. This is critical for the hierarchical dashboard and validation workflows. It depends on Accounts (users) and Tenant (organizations).

What It Contains
Department Model
Represents a department or division within an organization. Stores the name, description, and the manager who leads it. Departments can be nested (e.g., "Sales" under "Commercial").

Team Model
A smaller unit within a department. A team has a leader and members. Teams can be cross-functional if needed.

Position Model
Defines job titles and their place in the hierarchy. Each position has a title (e.g., "Head of Sales"), a level (junior, senior, executive), and reporting relationships.

Hierarchy Model
This is where the magic happens. It tracks who reports to whom. Each user has a direct supervisor. This model allows unlimited depth—a CEO can have department heads, who have managers, who have team leads, who have staff.

The hierarchy service provides methods to get all direct reports, get the entire reporting chain (upwards and downwards), and check if one user manages another.

Development Steps
Create the Department model. Test creating departments and assigning managers.

Add the Team model and link it to departments. Test that teams can have multiple members and a leader.

Build the Position model. This can be simple initially—just a title and a reporting level.

Implement the Hierarchy model. This is essentially a self-referential relationship—User can have a foreign key to another User as their supervisor. Test building chains: User A supervises B, B supervises C. Verify that you can query "all subordinates of A" correctly.

Create the hierarchy service. Implement methods to get the reporting chain, get all direct reports, and build the organization tree.

# How It Connects to Frontend
The organization chart page displays the company hierarchy as a tree. Users can expand and collapse nodes to see reporting relationships.

The department management screen allows Client Admins to create and edit departments, assign managers, and move users between teams.

When a manager looks at their team dashboard, the Structure app provides the list of who reports to them. When a supervisor needs to approve KPI data, the system uses the hierarchy to determine which supervisor is responsible.

# PHASE 5: KPI App
# Purpose
    The KPI app is the heart of Falcon PMS. It handles everything about Key Performance Indicators—defining them, setting targets, recording actuals, and calculating scores. This app depends on Tenant, Structure, and Accounts.

# What It Contains
# Framework Model
    A framework is a collection of KPIs designed for a specific sector. Commercial frameworks include revenue and margin KPIs. NGO frameworks include beneficiaries reached and grant utilization. You create these as templates that organizations can start from and customize.

# KPI Definition Model
    This is the actual KPI. It stores:

    Name and description

    Type (count, percentage, financial, yes/no, time, impact score)

    Calculation logic (higher is better or lower is better)

    Whether it's cumulative

    Weight (percentage of overall score)

    Who it's assigned to (individual, department, or company)

    Target value and target unit

    The period it applies to (annual, quarterly)

# Target Model
    Stores the target values for a KPI. For annual KPIs, there is one target record with the annual target. The phasing engine splits this across months.

# Phasing Model
    Stores the monthly targets derived from the annual target. Once the phasing wizard runs, these are locked and cannot be changed without approval.

# Actual Model
    Stores what was actually achieved each month. Each record has a period (year and month), the actual value, and a status (pending, approved, rejected). Only approved actuals appear on dashboards.

# Validation Model
    Tracks the approval history for actuals. When a supervisor approves or rejects data, this model records who did it, when, and any comments.

# Calculation Engine
    This is the brain. The calculator takes an actual and target and returns a score percentage and traffic light color.

    The formula service implements the two formulas:

    Higher is better: actual ÷ target × 100

    Lower is better: target ÷ actual × 100

    The traffic light service applies the thresholds: 90%+ is green, 50-89% is yellow, below 50% is red.

    The aggregator service rolls up scores from individuals to teams to departments to the whole company, respecting weights.

    The phasing engine splits annual targets across months based on seasonality patterns. For example, a retail KPI might have higher targets in December.

# Cascading Service
    This handles target cascading—taking a company target and breaking it down to departments, then to individuals. A revenue target of KES 15 billion might cascade to departments based on their contribution capacity.

# Development Steps
Start with the KPI Definition model. Get the basic fields working—name, type, target value, assignee.

Implement the phasing wizard. Create a system that takes an annual target and splits it into monthly targets based on simple distribution (even split initially, then add seasonality patterns).

Add the validation workflow. Create a status field on Actual and implement the approval flow. Test that pending actuals are not visible in dashboards until approved.

Build the cascading service. Start with simple rules—if a department has 5 people, split the department target equally. Then add more sophisticated logic.

Create the API endpoints. KPIs should be listable, creatable, and updatable based on permissions. Actuals need endpoints for data entry and approval. The dashboard endpoints should return calculated scores for the current user.

# How It Connects to Frontend
The KPI management screen allows Dashboard Champions to create KPIs, assign them to individuals or departments, and set targets.

The phasing wizard is a step-by-step form where the Dashboard Champion enters an annual target, selects seasonality patterns, and reviews the monthly breakdown before locking it.

The data entry screen shows staff their KPIs for the current month with target values. They enter actuals, attach evidence, and submit for approval.

The validation queue shows supervisors all pending submissions from their team. They can approve or reject with comments. Rejected entries return to staff for correction.

The KPI detail page shows performance over time with trend charts. It displays the current traffic light status, the score, and historical performance.

The personal dashboard shows a card for each KPI with the target, actual, score, and traffic light. It includes the mission status report section for narrative commentary.

# PHASE 6: Workflows App
# Purpose
    The Workflows app manages the approval and validation processes that run throughout the system. It depends on KPI, Accounts, and Structure.

# What It Contains
# Submission Model
    Tracks a piece of work submitted for approval. This could be KPI actuals, a performance review, or a target change request. The model stores the type of submission, the current status, who submitted it, and when.

# Approval Model
    Records each approval step. If a submission needs multiple approvals (e.g., KPI actuals approved by supervisor, then by department head), this model tracks each step separately.

# Comment Model
    Stores feedback on submissions. Supervisors can add comments when they approve or reject, and staff can respond.

# Escalation Model
    Handles cases where approvals are delayed. If a submission sits pending for 48 hours, the escalation model triggers reminders to the supervisor and copies their manager.

# Flow Definitions
    These define the approval paths for different types of submissions. A KPI actual might go to the direct supervisor only. A PIP approval might need supervisor, then HR, then department head.

# Orchestrator Service
    This is the central coordinator. When a submission is created, the orchestrator looks up the flow definition, creates the necessary approval steps, and sends the first notification.

# Reminder Service
    Runs on a schedule, checking for pending approvals that are overdue. It sends email and in-app reminders to the approvers.

# Development Steps
Create the Submission and Approval models. Test creating a submission and adding approval steps.

Implement the flow definitions. Start simple—just supervisor approval for KPI actuals. Then add more complex flows.

Build the orchestrator. Test that creating a submission correctly triggers the flow and creates approval steps.

Add the escalation logic. Test that pending approvals trigger reminders after the configured threshold.

Create the API endpoints for submissions and approvals. Supervisors should see a queue of pending approvals. Staff should see the status of their submissions.

# How It Connects to Frontend
The validation queue screen shows supervisors all pending approvals with links to view the details and approve or reject.

The submission status screen shows staff the current status of their submissions, who they're waiting on, and any comments.

The notification center shows alerts when action is required, with links directly to the submission.

# PHASE 7: Dashboard App
# Purpose
    The Dashboard app provides the hierarchical views that managers and executives use to see team performance. This is where the system becomes truly powerful—managers can see their own performance and their entire team's performance in one unified view. It depends on KPI, Structure, and Workflows.

# What It Contains
# View Definitions
    These aren't database models—they're services that define what different roles see. An executive sees all departments. A manager sees their team and their own performance. A staff member sees only themselves.

# Hierarchy Service
    This is the core engine. Given a user, it builds the tree of their direct reports, then their reports' reports, and so on. It collects KPI data for each person and rolls it up.

    The service returns a tree structure that the frontend can render. Each node has the user's name, role, KPI summary (green/yellow/red counts), and children nodes for their reports.

# Aggregator Service
    This calculates team-level totals. If a manager has five staff, the aggregator sums their KPI scores (weighted appropriately) to show the team's overall performance.

# Cache Service
    Dashboard data is expensive to calculate—it touches many records. The cache service stores calculated dashboard views for a short time (5-15 minutes) so repeated requests are fast.

    When data changes (a KPI is updated, a new actual is approved), the cache service invalidates the affected dashboard caches.

# Widget Service
    Provides individual dashboard components—a list of upcoming reviews, a chart of team performance over time, a list of pending approvals. Each widget is a separate service that can be cached independently.

# Development Steps
Start with the hierarchy service. Given a user, fetch their direct reports, then their reports, building the full tree. Test with a hierarchy three levels deep.

Add the aggregator. For each user, calculate their overall KPI score and status counts. Then roll up to team and department levels.

Implement caching. Calculate a dashboard for a manager, store it in Redis, and verify that the second request is faster.

Create the widget services. Build simple widgets first—pending approvals count, overdue tasks, team status summary.

Build the API endpoints. The main dashboard endpoint returns the full hierarchy tree. Individual widget endpoints return specific components.

# How It Connects to Frontend
The executive dashboard page shows a high-level view—department cards showing overall performance, trend charts, and key metrics. Clicking a department drills down to that department's dashboard.

The manager dashboard has two sections: personal KPI cards at the top, then a team overview below. The team overview shows each direct report as a card with their name, role, and traffic light status. Clicking a card drills down to that person's full dashboard, and from there you can go further down the hierarchy.

The staff dashboard is simpler—personal KPIs, mission status report, and pending tasks.

The drill-down functionality is seamless. A manager clicks a team member, and the API returns that person's complete dashboard with their KPIs and their team if they're a manager themselves.

# PHASE 8: Reviews App
# Purpose
    The Reviews app handles performance appraisals and Performance Improvement Plans (PIPs). It depends on KPI (for performance scores), Accounts, and Structure.

# What It Contains
# Cycle Model
    Defines a review period—mid-year or end-year. Stores the dates for self-assessment, supervisor review, and final approval.

# SelfAssessment Model
    Stores the staff member's self-rating and comments. They can rate themselves on each KPI and add narrative about their performance.

# SupervisorReview Model
    Stores the manager's evaluation. They rate the staff member, add comments, and can override the automatic KPI score if needed.

# PIP Model
    Performance Improvement Plans. Stores the reason for the PIP, the improvement areas, expected outcomes, and timeframes.

# PIPAction Model
    Individual steps in a PIP. Each action has a due date, status (pending, in progress, completed), and notes from the manager and staff member.

# Calibration Service
    When multiple managers rate staff, the calibration service helps ensure consistency. It identifies outliers and suggests calibration sessions.

# Development Steps
Create the Cycle, SelfAssessment, and SupervisorReview models. Test that a review can be created and that assessments can be linked to a specific cycle.

Implement the PIP models. Test creating a PIP, adding actions, and tracking progress.

Build the score calculator. A final score might combine KPI performance (70%) with supervisor rating (30%). Implement the weighting logic.

Create the calibration service. Start simple—identify managers who consistently rate higher or lower than average.

Build the API endpoints. Staff should be able to submit self-assessments. Managers should see a queue of reviews to complete.

# How It Connects to Frontend
The review cycle page shows upcoming and past reviews. Staff see when their self-assessment is due. Managers see which staff have completed self-assessments and which still need to be reviewed.

The self-assessment form lists the staff member's KPIs with their actual performance and automatic score. They add comments and their own rating, then submit.

The supervisor review screen shows the staff member's self-assessment alongside their KPI data. The manager adds their evaluation and final rating.

The PIP dashboard shows all active PIPs with status. Clicking a PIP shows the plan, actions, and progress notes. Managers can add coaching notes and mark actions complete.

PHASE 9: Mission App
# Purpose
    The Mission app handles the Mission Status Reports—the narrative reports that accompany KPI data. This is where staff explain their performance, challenges, and planned actions. It depends on KPI and Accounts.

# What It Contains
# Report Model
    Represents a Mission Status Report. It's linked to a user and a period (month/quarter). It has a status (draft, submitted, approved).

# Section Model
    Each report has one section per KPI. The section stores the KPI, its current traffic light, and the three narrative fields: Performance Analysis, Key Challenges, and Actions Planned.

# Commentary Model
    Stores the summary boxes—overall reflection and commitments for the next period.

# Template Model
    Allows organizations to customize what sections appear in the report. A consulting firm might want "Client Feedback" as a section; an NGO might want "Community Impact".

# Generator Service
    Creates a report for a user and period. It pulls all their KPIs with current performance and creates a section for each.

# Exporter Service
    Exports the report to PDF. The PDF is formatted for use in review meetings—professional, with branding, and easy to read.

# Development Steps
Create the Report and Section models. Test generating a report for a user with several KPIs.

Implement the generator service. Given a user and period, it should find all their KPIs, calculate current performance, and create sections.

Add the narrative fields. Staff should be able to edit the three narrative fields per KPI and the summary boxes.

Build the PDF exporter. Use a library like ReportLab or WeasyPrint to generate professional PDFs.

Create the API endpoints. Staff should be able to view, edit, and submit reports. Managers should be able to view their team's reports.

# How It Connects to Frontend
The Mission Status Report page shows a form with a section for each KPI. Each section displays the KPI name, current traffic light, and score. Below are three text areas: Performance Analysis, Key Challenges, and Actions Planned.

At the bottom are summary boxes for Overall Reflection and Commitments for Next Period.

A submit button sends the report for review. Managers can view reports for their team members and add comments.

The export button generates a PDF that can be downloaded or printed for review meetings.

# PHASE 10: Tasks App
# Purpose
    The Tasks app manages the tasks and dependencies that support KPI achievement. It depends on Accounts, Structure, and KPI.

# What It Contains
# Task Model
    Represents a piece of work. It has a title, description, start date, due date, status (ongoing, completed, late, cancelled, postponed), and an optional link to a KPI.

# Assignment Model
    Tracks who a task is assigned to. A task can be assigned to one person but can have multiple assignments if it's a group task.

# Dependency Model
    Records that one task depends on another. If Task B depends on Task A, Task B cannot start until Task A is complete.

# DependencyGraph Service
    Builds a graph of all tasks and their dependencies. This can detect circular dependencies (A depends on B depends on A) and identify critical path tasks.

# Acceptance Service
    Handles task acceptance. When a task is assigned, the assignee must accept or decline it. The service tracks who accepted, when, and any conditions.

# Development Steps
Create the Task model. Start with basic fields—title, due date, status, assignee.

Add the Dependency model. Test creating dependencies and querying "what depends on this task" and "what does this task depend on."

Implement the status logic. Tasks become "late" automatically when the due date passes and they're not completed.

Build the acceptance workflow. When a task is assigned, create an acceptance record. The task isn't considered active until accepted.

Create the dependency graph service. Test that it can detect cycles and identify blocked tasks.

Build the API endpoints. Users should see tasks assigned to them. Managers should see tasks they've assigned to others.

# How It Connects to Frontend
The task board shows tasks in columns by status: To Do, In Progress, Completed, Late. Users can drag tasks between columns.

The dependencies view shows a graph of tasks, with arrows indicating dependencies. Blocked tasks are highlighted.

When a user is assigned a task, they get a notification with Accept/Decline buttons. Accepting starts the task; declining sends it back to the assigner.

The dependencies tab shows all tasks assigned to others that the user is waiting on, and all tasks others are waiting on from the user.

# PHASE 11: Reports App
# Purpose
    The Reports app provides analytics and export functionality. It depends on every other app—KPI, Reviews, Tasks, etc.—because it reports on all of them.

# What It Contains
# Report Templates
    Define what data a report includes. A KPI achievement report includes KPIs, targets, actuals, and scores. A compliance report shows who has submitted data and who hasn't.

# Export Generators
    Handle exporting to different formats. PDF generator creates professional reports. Excel generator creates spreadsheets for further analysis. PowerPoint generator creates presentation decks for leadership.

# Analytics Services
    Calculate trends over time. The trend service shows whether performance is improving or declining. The compliance service shows who is up to date and who is behind.

# Query Service
    Builds optimized database queries for large reports. Instead of loading every KPI individually, the query service uses Django's aggregation features to get summary data efficiently.

# Development Steps
Start with a simple report—KPI achievement for a user over the past year. Build the query to fetch the data efficiently.

Implement the Excel exporter. Start with a basic export of the data to a spreadsheet.

Add the PDF exporter. Create a template for a professional report with headers, footers, and branding.

Build the trend analytics. Calculate month-over-month changes and identify improving or declining trends.

Create the report builder API. Users should be able to select a report type, filter by date range and department, and generate the report.

# How It Connects to Frontend
The report builder screen allows users to select a report type, choose filters (date range, department, individual), and generate. Options include PDF, Excel, or PowerPoint.

The generated report displays in the browser with the option to download.

Executive dashboards show trend charts and compliance summaries powered by the analytics services.

# PHASE 12: Notifications App
# Purpose
    The Notifications app handles all communication from the system—email, SMS, and in-app notifications. It depends on all other apps because they trigger notifications.

# What It Contains
# Template Model
    Stores notification templates. Each template has a subject, body (with placeholders), and a channel (email, SMS, in-app). Placeholders like {{user_name}} and {{kpi_name}} are replaced with actual values.

# Queue Model
    Tracks notifications that need to be sent. This allows batch processing and retry logic. If an email fails, it stays in the queue to be retried.

# Delivery Model
    Records when a notification was sent, to whom, through which channel, and whether it was successful. This is critical for audit trails.

# Dispatcher Service
    The central coordinator. When a trigger occurs (e.g., data not entered by the 5th), the dispatcher finds the right template, replaces placeholders, and queues the notification.

# Scheduler Service
    Runs on a schedule, checking for recurring notifications like monthly reminders and renewal alerts.

# Development Steps
Create the Template and Queue models. Test creating a template and queueing a notification.

Implement the email channel. Use a service like SendGrid or AWS SES to send emails. Test that queued emails are sent.

Add the in-app channel. In-app notifications are stored in the database and fetched by the frontend.

Build the dispatcher. Given a trigger (like "monthly_data_reminder"), it should find the right template, format the notification, and queue it.

Implement the scheduler. Create periodic tasks that check for conditions (e.g., is it the 5th? has data been entered?) and trigger notifications.

# How It Connects to Frontend
The notification center in the frontend shows a list of in-app notifications. Unread notifications are highlighted, and clicking one takes the user to the relevant page.

Email notifications are sent automatically. They include links back to the application (e.g., "Click here to approve KPI data").

Users can manage notification preferences—choose which notifications they receive by email vs. in-app.

Connecting Frontend to Backend: How It All Works Together
API Communication Pattern
Every frontend page follows the same pattern:

The page loads, and a React hook (like useDashboard) calls an API endpoint.

The API endpoint checks permissions based on the JWT token in the request.

The endpoint uses services from the relevant app (e.g., DashboardService, KPIService) to fetch data.

The data is returned as JSON.

React renders the data, showing loading states while waiting and error states if something fails.

Authentication Flow
User visits /login, enters email and password.

Frontend calls /api/v1/auth/login/.

Backend validates credentials, returns JWT access and refresh tokens.

Frontend stores tokens and includes the access token in all subsequent requests.

When the access token expires, the frontend automatically uses the refresh token to get a new one.

Multi-Tenancy in Practice
When a user logs in, the backend knows their tenant from their user record.

The frontend includes a header X-Tenant-ID with every request.

The backend's tenant middleware reads this header and sets the current tenant in the request.

All TenantAwareManager queries automatically filter to this tenant.

The user never sees data from other organizations.

Real-Time Updates
For notifications, the system uses WebSockets. When a notification is triggered:

The backend dispatcher creates the notification.

It pushes a message through a WebSocket to the relevant user's connection.

The frontend receives the message and updates the notification count in real-time.

The user sees the notification immediately without refreshing the page.

# CONCLUSION
This guide has walked through building Falcon PMS app by app, from the foundation to the full feature set. Each app was built with a clear purpose, minimal dependencies on others, and a clean separation of concerns.

The development order ensures that at every stage, you have a working system. After Phase 2 (Accounts), you can log in. After Phase 5 (KPI), you can track performance. After Phase 7 (Dashboard), managers can see their teams. Each phase adds value without breaking what came before.

The frontend and backend are designed to work together seamlessly. The backend provides clean APIs with proper permissions. The frontend consumes these APIs and provides an intuitive user experience. The two can be developed in parallel once the API contracts are defined.

This architecture scales from a single organization to thousands, handles complex hierarchical relationships, and provides real-time visibility into performance across the entire organization.

