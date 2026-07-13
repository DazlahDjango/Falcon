If the first task is tested and done we can proceed bellow
Do you think we need a reporting module too(services, views) etc??


Report Module — Design Overview
Purpose
Provide Super Admin and Client Admin with:

Pre-built reports — common reports with filters and export options

Audit trail visibility — who did what, when, and on which user

Compliance monitoring — who has/hasn't completed required actions

Export capabilities — CSV, Excel, PDF formats for sharing or audits

Report Categories
1. User Reports
Report Name	Description	Key Fields	Admin Type
User Directory	Complete list of all users with their details	Name, email, role, department, manager, status, join date, last login	Both
User Role Distribution	Breakdown of users by role	Role name, count, percentage of total	Both
User Department Distribution	Breakdown of users by department	Department name, count, list of users	Both
Inactive Users	Users who haven't logged in for a specified period	Name, email, role, department, last login, days inactive	Both
Recently Added Users	Users created in a specific date range	Name, email, role, created date, created by	Both
User Activity Summary	Overall user engagement metrics	Total users, active users, inactive users, new users (period)	Both
2. Audit & Compliance Reports
Report Name	Description	Key Fields	Admin Type
Audit Trail	All actions performed on users	Timestamp, actor, action type, target user, before/after values, IP address	Both (scoped)
Login Activity	User login history	User, timestamp, IP address, user agent, success/failure status	Both
Password Changes	History of password changes	User, timestamp, IP address, changed by (self or admin)	Both
Role Change History	When and who changed user roles	User, old role, new role, changed by, timestamp	Both
Suspension/Activation Log	Users suspended or activated	User, action, performed by, timestamp, reason (if provided)	Both
Compliance Summary	Who has/hasn't completed required actions	User, MFA enabled, password last changed, last login, data submission status	Client Admin