### Management Commands For Reporting Platform (reportplt)

The Reporting Platform (`reportplt`) module includes a comprehensive suite of Django management commands for multi-tenant report lifecycle operations, template provisioning, automated scheduling, dashboard and widget management, distribution lists, and export storage cleanup.

---

### 1. Report Lifecycle & Generation (`manage_reports`)

`python manage.py manage_reports [options]`

#### Listing & Catalog Summary
```bash
# View tenant-wide reporting summary (total reports, status breakdown, recent executions)
python manage.py manage_reports --action summary
python manage.py manage_reports --action summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# List all reports in tenant
python manage.py manage_reports --action list
python manage.py manage_reports --action list --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# View detailed metadata, configuration, filters, and execution history for a single report
python manage.py manage_reports --action details --report-name "Executive Performance Review"
python manage.py manage_reports --action details --report-id <REPORT_UUID>
```

#### Report Creation
```bash
# Create a new report definition
python manage.py manage_reports --action create --name "Q3 Executive Performance Review" --report-type kpi_executive_summary --data-source kpi --category executive --format pdf --description "Quarterly executive KPI summary"
python manage.py manage_reports --action create --name "Department Review Summary" --report-type performance_summary --data-source reviews --category operations --format excel
```

#### Manual Generation & Execution
```bash
# Trigger immediate on-demand report compilation and export generation
python manage.py manage_reports --action generate --report-name "Executive Performance Review"
python manage.py manage_reports --action generate --report-id <REPORT_UUID>
```

#### Status & Lifecycle Control
```bash
# Publish report (make available to authorized viewers)
python manage.py manage_reports --action publish --report-name "Executive Performance Review"
python manage.py manage_reports --action publish --report-id <REPORT_UUID>

# Unpublish report (revert to draft state)
python manage.py manage_reports --action unpublish --report-name "Executive Performance Review"
python manage.py manage_reports --action unpublish --report-id <REPORT_UUID>

# Archive report
python manage.py manage_reports --action archive --report-name "Executive Performance Review"
python manage.py manage_reports --action archive --report-id <REPORT_UUID>

# Restore archived report back to draft
python manage.py manage_reports --action restore --report-name "Executive Performance Review"
python manage.py manage_reports --action restore --report-id <REPORT_UUID>

# Permanently delete report
python manage.py manage_reports --action delete --report-name "Executive Performance Review"
python manage.py manage_reports --action delete --report-id <REPORT_UUID>
```

---

### 2. Report Templates Management (`manage_templates`)

`python manage.py manage_templates [options]`

#### Prebuilt Templates Seeding
```bash
# Seed standard canonical prebuilt templates (Executive, KPI Summary, Target Gap Analysis, etc.)
python manage.py manage_templates --action seed_prebuilt
python manage.py manage_templates --action seed_prebuilt --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
```

#### Listing & Template Details
```bash
# List all available report templates (prebuilt and custom)
python manage.py manage_templates --action list
python manage.py manage_templates --action list --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# Inspect template configuration, widget layouts, and visual styling
python manage.py manage_templates --action details --template-name "Executive Performance Template"
python manage.py manage_templates --action details --template-id <TEMPLATE_UUID>
```

#### Template Creation & Duplication
```bash
# Create a new custom template
python manage.py manage_templates --action create --name "Quarterly Departmental Template" --template-type executive --category management --description "Custom departmental review layout"

# Duplicate an existing template to create a customized clone
python manage.py manage_templates --action duplicate --template-name "Executive Performance Template" --new-name "Executive Custom Clone"
python manage.py manage_templates --action duplicate --template-id <TEMPLATE_UUID> --new-name "Custom Clone"
```

#### Publishing, Default & Lifecycle
```bash
# Set a template as the default for its category/type
python manage.py manage_templates --action set_default --template-name "Executive Performance Template"

# Publish / Unpublish templates
python manage.py manage_templates --action publish --template-name "Custom Template"
python manage.py manage_templates --action unpublish --template-name "Custom Template"

# Delete custom template
python manage.py manage_templates --action delete --template-name "Deprecated Template"
python manage.py manage_templates --action delete --template-id <TEMPLATE_UUID>
```

---

### 3. Automated Report Schedules (`manage_schedules`)

`python manage.py manage_schedules [options]`

#### Listing & Summary
```bash
# View summary of scheduled report jobs (active, paused, due, upcoming executions)
python manage.py manage_schedules --action summary
python manage.py manage_schedules --action summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# List all schedules
python manage.py manage_schedules --action list
```

#### Schedule Inspection & Details
```bash
# View schedule details, cron settings, recipient distribution list, and last run status
python manage.py manage_schedules --action details --schedule-name "Weekly Executive Digest"
python manage.py manage_schedules --action details --schedule-id <SCHEDULE_UUID>
```

#### Schedule Creation
```bash
# Create an automated recurring report schedule
python manage.py manage_schedules --action create --name "Weekly Executive Digest" --report-name "Executive Performance Review" --frequency weekly --recipients "careen@falcontech.com,executives@falcontech.com"
python manage.py manage_schedules --action create --name "Monthly KPI Summary" --report-id <REPORT_UUID> --frequency monthly --recipients "sarah.jenkins@globalapex.com"
```

#### Triggering & Due Jobs Audit
```bash
# Trigger an immediate run of a schedule outside of its cron window
python manage.py manage_schedules --action run_now --schedule-name "Weekly Executive Digest"
python manage.py manage_schedules --action run_now --schedule-id <SCHEDULE_UUID>

# List all schedules currently due for execution
python manage.py manage_schedules --action due

# List overdue schedules requiring maintenance
python manage.py manage_schedules --action overdue
```

#### Pause, Resume & Lifecycle
```bash
# Pause / Resume recurring schedule
python manage.py manage_schedules --action pause --schedule-name "Weekly Executive Digest"
python manage.py manage_schedules --action resume --schedule-name "Weekly Executive Digest"

# Activate / Deactivate schedule
python manage.py manage_schedules --action activate --schedule-name "Weekly Executive Digest"
python manage.py manage_schedules --action deactivate --schedule-name "Weekly Executive Digest"

# Delete schedule
python manage.py manage_schedules --action delete --schedule-name "Obsolete Schedule"
python manage.py manage_schedules --action delete --schedule-id <SCHEDULE_UUID>
```

---

### 4. Real-Time Dashboards & Widgets (`manage_dashboards`)

`python manage.py manage_dashboards [options]`

#### Listing & Overview
```bash
# View dashboards summary (total dashboards, published, widgets count)
python manage.py manage_dashboards --action summary
python manage.py manage_dashboards --action summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# List all dashboards
python manage.py manage_dashboards --action list
```

#### Dashboard Details & Widgets
```bash
# Inspect dashboard configuration, layout grid, and linked widgets
python manage.py manage_dashboards --action details --dashboard-name "Executive Cockpit"
python manage.py manage_dashboards --action details --dashboard-id <DASHBOARD_UUID>
```

#### Dashboard & Widget Creation
```bash
# Create a new dashboard
python manage.py manage_dashboards --action create --name "Executive Cockpit" --dashboard-type executive --description "Real-time executive performance cockpit"

# Attach a widget to an existing dashboard
python manage.py manage_dashboards --action add_widget --dashboard-name "Executive Cockpit" --widget-name "Revenue Achievement KPI" --widget-type kpi
python manage.py manage_dashboards --action add_widget --dashboard-id <DASHBOARD_UUID> --widget-name "Quarterly Review Distribution" --widget-type chart
```

#### Realtime Refresh & Publishing
```bash
# Broadcast realtime refresh event and invalidate cached dashboard metrics
python manage.py manage_dashboards --action refresh --dashboard-name "Executive Cockpit"
python manage.py manage_dashboards --action refresh --dashboard-id <DASHBOARD_UUID>

# Publish / Unpublish dashboard
python manage.py manage_dashboards --action publish --dashboard-name "Executive Cockpit"
python manage.py manage_dashboards --action unpublish --dashboard-name "Executive Cockpit"

# Delete dashboard
python manage.py manage_dashboards --action delete --dashboard-name "Old Dashboard"
python manage.py manage_dashboards --action delete --dashboard-id <DASHBOARD_UUID>
```

---

### 5. Distribution Lists & Recipient Groups (`manage_distributions`)

`python manage.py manage_distributions [options]`

#### Listing & Summary
```bash
# View distribution summary (total lists, total recipients)
python manage.py manage_distributions --action summary
python manage.py manage_distributions --action summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# List all distribution groups
python manage.py manage_distributions --action list

# View members of a specific distribution list
python manage.py manage_distributions --action details --list-name "Leadership Team"
python manage.py manage_distributions --action details --list-id <LIST_UUID>
```

#### Distribution List Creation & Member Management
```bash
# Create a new distribution list with initial members
python manage.py manage_distributions --action create --name "Leadership Team" --description "Executive stakeholders" --members "careen@falcontech.com,ceo@falcontech.com"

# Add a member email to an existing list
python manage.py manage_distributions --action add_member --list-name "Leadership Team" --email "director@falcontech.com"

# Remove a member email from a list
python manage.py manage_distributions --action remove_member --list-name "Leadership Team" --email "director@falcontech.com"

# Delete distribution list
python manage.py manage_distributions --action delete --list-name "Temporary Committee"
python manage.py manage_distributions --action delete --list-id <LIST_UUID>
```

---

### 6. Report Exports & Executions (`manage_exports`)

`python manage.py manage_exports [options]`

#### Listing & Executions Summary
```bash
# View executions & export summary (total executions, status breakdown, storage volume)
python manage.py manage_exports --action summary
python manage.py manage_exports --action summary --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# List recent report executions and downloadable export files
python manage.py manage_exports --action list
python manage.py manage_exports --action list --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# Inspect export file metadata, download URL, checksum, and execution duration
python manage.py manage_exports --action details --export-id <EXECUTION_OR_EXPORT_UUID>
```

#### Direct Export Generation
```bash
# Directly trigger report compilation in specified format (pdf, excel, csv, json, html)
python manage.py manage_exports --action export --report-name "Executive Performance Review" --format pdf
python manage.py manage_exports --action export --report-name "Executive Performance Review" --format excel
python manage.py manage_exports --action export --report-id <REPORT_UUID> --format csv
```

#### Storage & Retention Cleanup
```bash
# Purge expired or completed export artifacts older than X days
python manage.py manage_exports --action cleanup_expired --days 30
python manage.py manage_exports --action cleanup_expired --days 7 --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
```

---

### 7. Global & Tenant Seeders (`seed_report_settings`)

`python manage.py seed_report_settings [options]`

```bash
# Seed canonical prebuilt report templates for a specific tenant
python manage.py seed_report_settings --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# Seed prebuilt report templates across ALL active tenants in the platform
python manage.py seed_report_settings --all-tenants
```
