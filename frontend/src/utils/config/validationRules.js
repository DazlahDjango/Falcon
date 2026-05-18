// frontend/src/utils/config/validationRules.js
import * as yup from 'yup';

export const backupTriggerSchema = yup.object({
  app_name: yup.string().required('Application is required'),
  backup_type: yup.string().oneOf(['full', 'incremental', 'differential', 'synthetic', 'cdp']).required('Backup type is required')
});

export const backupPolicySchema = yup.object({
  backup_type: yup.string().oneOf(['full', 'incremental', 'differential', 'synthetic', 'cdp']),
  retention_days: yup.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 365 days'),
  retention_full_weeks: yup.number().min(1).max(52),
  retention_monthly: yup.number().min(1).max(120),
  compression_enabled: yup.boolean(),
  encryption_enabled: yup.boolean(),
  incremental_chain_length: yup.number().min(1).max(365),
  parallel_backup_workers: yup.number().min(1).max(16),
  backup_timeout_minutes: yup.number().min(5).max(1440),
  schedule_cron: yup.string().matches(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/[0-9]+)( )(\*|([0-9]|1[0-9]|2[0-3])|\*\/[0-9]+)( )(\*|([1-9]|[12][0-9]|3[01])|\*\/[0-9]+)( )(\*|([1-9]|1[0-2])|\*\/[0-9]+)( )(\*|([0-6])|\*\/[0-9]+)$/, 'Invalid cron format')
});

export const maintenanceScheduleSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  maintenance_type: yup.string().oneOf(['full', 'partial', 'rolling', 'emergency']).required('Maintenance type is required'),
  scheduled_start: yup.string().required('Start time is required'),
  scheduled_end: yup.string()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { scheduled_start } = this.parent;
      if (!scheduled_start || !value) return true;
      return new Date(value) > new Date(scheduled_start);
    }),
  reason: yup.string().required('Reason is required').min(10, 'Please provide a detailed reason'),
  affected_apps: yup.array().when('maintenance_type', {
    is: 'partial',
    then: (schema) => schema.min(1, 'At least one app must be selected for partial maintenance'),
    otherwise: (schema) => schema
  })
});

export const drPlanSchema = yup.object({
  name: yup.string().required('Plan name is required').min(3, 'Name must be at least 3 characters'),
  app_name: yup.string().required('Application is required'),
  rto_target_minutes: yup.number().min(5, 'RTO must be at least 5 minutes').max(1440, 'RTO cannot exceed 24 hours'),
  rpo_target_minutes: yup.number().min(5, 'RPO must be at least 5 minutes').max(10080, 'RPO cannot exceed 7 days'),
  test_frequency_days: yup.number().min(7, 'Test frequency must be at least 7 days').max(180, 'Test frequency cannot exceed 180 days'),
  standby_endpoint: yup.string().url('Must be a valid URL'),
  recovery_steps: yup.array().min(1, 'At least one recovery step is required')
});

export const scheduleSchema = yup.object({
  name: yup.string().required('Schedule name is required'),
  schedule_type: yup.string().oneOf(['backup', 'maintenance', 'health_check', 'dr_drill']).required(),
  cron_expression: yup.string()
    .required('Cron expression is required')
    .matches(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/[0-9]+)( )(\*|([0-9]|1[0-9]|2[0-3])|\*\/[0-9]+)( )(\*|([1-9]|[12][0-9]|3[01])|\*\/[0-9]+)( )(\*|([1-9]|1[0-2])|\*\/[0-9]+)( )(\*|([0-6])|\*\/[0-9]+)$/, 'Invalid cron format'),
  timezone: yup.string().default('UTC'),
  weekday_only: yup.boolean(),
  status: yup.string().oneOf(['active', 'paused']).default('active')
});

export const quotaSchema = yup.object({
  total_backup_storage_gb: yup.number().min(1, 'Storage must be at least 1 GB').max(1000000, 'Storage cannot exceed 1 PB'),
  max_backup_count: yup.number().min(10, 'Must allow at least 10 backups').max(10000, 'Cannot exceed 10,000 backups'),
  max_restore_per_day: yup.number().min(1).max(1000),
  warning_threshold_percent: yup.number().min(50).max(100)
});

export const encryptionKeySchema = yup.object({
  key_alias: yup.string().required('Key alias is required').matches(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens allowed'),
  key_source: yup.string().oneOf(['aws_kms', 'gcp_kms', 'azure_keyvault', 'hashicorp_vault', 'local_hsm']).required(),
  key_region: yup.string().when('key_source', {
    is: (source) => ['aws_kms', 'gcp_kms', 'azure_keyvault'].includes(source),
    then: (schema) => schema.required('Region is required for cloud KMS'),
    otherwise: (schema) => schema
  }),
  is_default: yup.boolean()
});

export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: null };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { valid: false, errors };
  }
};

export const formatValidationErrors = (errors) => {
  if (!errors) return [];
  return Object.entries(errors).map(([field, message]) => ({ field, message }));
};