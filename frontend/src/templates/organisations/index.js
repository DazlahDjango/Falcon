// Organisation Templates
// Default templates and configurations for organisation features

export const DEFAULT_BRANDING = {
  primary_color: '#3B82F6',
  secondary_color: '#64748B',
  accent_color: '#10B981',
  logo_url: null,
  favicon_url: null,
  custom_css: '',
  theme: 'light',
  font_family: 'Inter, sans-serif',
};

export const DEFAULT_ORGANISATION_SETTINGS = {
  name: '',
  slug: '',
  description: '',
  website: '',
  timezone: 'UTC',
  currency: 'USD',
  language: 'en',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  fiscal_year_start: 1, // January
  working_days: [1, 2, 3, 4, 5], // Monday to Friday
  working_hours_start: '09:00',
  working_hours_end: '17:00',
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  email_notifications: true,
  in_app_notifications: true,
  kpi_alerts: true,
  user_activity_alerts: false,
  system_alerts: true,
  weekly_reports: true,
  monthly_reports: true,
};

export const DEFAULT_SECURITY_SETTINGS = {
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_symbols: false,
  session_timeout: 480, // 8 hours in minutes
  max_login_attempts: 5,
  lockout_duration: 30, // minutes
  two_factor_required: false,
  ip_whitelist: [],
};

export const DEFAULT_BILLING_SETTINGS = {
  billing_email: '',
  billing_phone: '',
  billing_address: '',
  billing_city: '',
  billing_country: '',
  billing_zip: '',
  vat_number: '',
  tax_rate: 0,
  invoice_currency: 'USD',
  invoice_notes: '',
  payment_terms: 30, // days
};

export const EMAIL_TEMPLATES = {
  welcome_organisation: {
    subject: 'Welcome to {{organisation_name}}',
    body: `
      Dear {{user_name}},

      Welcome to {{organisation_name}}! You have been successfully added to our organisation.

      Your account details:
      - Email: {{user_email}}
      - Role: {{user_role}}
      - Organisation: {{organisation_name}}

      You can now access the organisation dashboard at: {{dashboard_url}}

      If you have any questions, please contact your organisation administrator.

      Best regards,
      {{organisation_name}} Team
    `,
  },

  user_invitation: {
    subject: 'You have been invited to join {{organisation_name}}',
    body: `
      Hello,

      You have been invited to join {{organisation_name}} as a {{role_name}}.

      Please click the link below to accept the invitation and set up your account:

      {{invitation_url}}

      This invitation will expire in 7 days.

      If you did not expect this invitation, please ignore this email.

      Best regards,
      {{organisation_name}} Team
    `,
  },

  kpi_alert: {
    subject: 'KPI Alert: {{kpi_name}} - {{status}}',
    body: `
      Dear {{user_name}},

      This is an automated alert regarding the KPI "{{kpi_name}}" in {{organisation_name}}.

      Current Status: {{status}}
      Current Value: {{current_value}}
      Target Value: {{target_value}}
      Progress: {{progress}}%

      {{alert_message}}

      Please review this KPI at: {{kpi_url}}

      Best regards,
      {{organisation_name}} Team
    `,
  },

  subscription_renewal: {
    subject: 'Your {{organisation_name}} subscription is renewing soon',
    body: `
      Dear {{user_name}},

      Your {{organisation_name}} subscription is set to renew on {{renewal_date}}.

      Current Plan: {{plan_name}}
      Renewal Amount: {{amount}} {{currency}}

      You can manage your subscription at: {{billing_url}}

      If you have any questions about your subscription, please contact our support team.

      Best regards,
      {{organisation_name}} Team
    `,
  },
};

export const DASHBOARD_WIDGET_TEMPLATES = {
  kpi_overview: {
    title: 'KPI Overview',
    type: 'chart',
    size: 'large',
    config: {
      chart_type: 'bar',
      show_trend: true,
      show_targets: true,
    },
  },

  recent_activity: {
    title: 'Recent Activity',
    type: 'list',
    size: 'medium',
    config: {
      max_items: 10,
      show_timestamps: true,
    },
  },

  subscription_status: {
    title: 'Subscription Status',
    type: 'card',
    size: 'small',
    config: {
      show_usage: true,
      show_renewal_date: true,
    },
  },

  quick_actions: {
    title: 'Quick Actions',
    type: 'buttons',
    size: 'small',
    config: {
      actions: ['add_user', 'create_kpi', 'generate_report'],
    },
  },

  alerts: {
    title: 'Alerts',
    type: 'alerts',
    size: 'small',
    config: {
      show_critical_only: false,
      max_alerts: 5,
    },
  },
};

export const WORKFLOW_TEMPLATES = {
  kpi_approval: {
    name: 'KPI Creation Approval',
    description: 'Requires approval before new KPIs can be created',
    steps: [
      {
        name: 'Department Head Review',
        type: 'approval',
        assignees: ['department_head'],
        required: true,
      },
      {
        name: 'Organisation Admin Final Approval',
        type: 'approval',
        assignees: ['client_admin'],
        required: true,
      },
    ],
  },

  user_onboarding: {
    name: 'User Onboarding',
    description: 'Automated process for new user setup',
    steps: [
      {
        name: 'Send Welcome Email',
        type: 'email',
        template: 'welcome_organisation',
        required: true,
      },
      {
        name: 'Assign Default Role',
        type: 'action',
        action: 'assign_role',
        config: { role: 'staff' },
        required: true,
      },
      {
        name: 'Setup Profile',
        type: 'form',
        form_fields: ['department', 'position', 'manager'],
        required: false,
      },
    ],
  },
};

export default {
  DEFAULT_BRANDING,
  DEFAULT_ORGANISATION_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_BILLING_SETTINGS,
  EMAIL_TEMPLATES,
  DASHBOARD_WIDGET_TEMPLATES,
  WORKFLOW_TEMPLATES,
};