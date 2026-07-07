/**
 * Provisioning helpers — normalize backend API shapes for UI components.
 */

export const PIPELINE_STEPS = [
  { code: 'STARTING', title: 'Initialize', description: 'Starting provisioning pipeline' },
  { code: 'CREATING_SCHEMA', title: 'Create Schema', description: 'Creating isolated database schema' },
  { code: 'MIGRATING', title: 'Run Migrations', description: 'Applying database migrations' },
  { code: 'PROVISIONING_RESOURCES', title: 'Resource Limits', description: 'Setting subscription quotas' },
  { code: 'SEEDING', title: 'Seed Data', description: 'Loading default roles and configuration' },
  { code: 'COMPLETED', title: 'Complete', description: 'Organization is ready' },
];

export function normalizeOrgStatus(status) {
  return (status || '').toUpperCase();
}

/** Merge list/detail provisioning fields from backend serializers. */
export function getProvisioningMeta(org) {
  if (!org) return {};

  if (org.provisioning && typeof org.provisioning === 'object') {
    return org.provisioning;
  }

  return {
    status: org.provisioning_status,
    progress: org.provisioning_progress ?? 0,
    error: org.provisioning_error,
    step_name: org.provisioning_step_name,
    message: org.provisioning_message,
    ...(org.metadata?.provisioning || {}),
  };
}

export function getStepStates(provMeta = {}, orgStatus = '') {
  const status = normalizeOrgStatus(orgStatus);
  const currentCode = (provMeta.status || '').toUpperCase();
  const order = PIPELINE_STEPS.map((s) => s.code);
  const currentIndex = order.indexOf(currentCode);

  if (status === 'ACTIVE' || currentCode === 'COMPLETED') {
    return PIPELINE_STEPS.map(() => 'completed');
  }

  if (status === 'FAILED' || currentCode === 'FAILED') {
    return PIPELINE_STEPS.map((_, index) => {
      if (currentIndex === -1) return index === 0 ? 'failed' : 'pending';
      if (index < currentIndex) return 'completed';
      if (index === currentIndex) return 'failed';
      return 'pending';
    });
  }

  if (currentIndex === -1) {
    return PIPELINE_STEPS.map(() => 'pending');
  }

  return PIPELINE_STEPS.map((_, index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  });
}

export function buildLogEntries(provMeta = {}) {
  if (!provMeta || Object.keys(provMeta).length === 0) return [];

  const entries = [];

  if (provMeta.started_at) {
    entries.push({
      level: 'info',
      time: provMeta.started_at,
      message: 'Provisioning pipeline started.',
    });
  }

  if (provMeta.step_name || provMeta.status) {
    entries.push({
      level: provMeta.status === 'FAILED' ? 'error' : 'info',
      time: provMeta.updated_at || provMeta.started_at,
      message: provMeta.message || `Step: ${provMeta.step_name || provMeta.status}`,
    });
  }

  if (provMeta.status === 'COMPLETED') {
    entries.push({
      level: 'success',
      time: provMeta.updated_at,
      message: provMeta.message || 'Provisioning completed successfully.',
    });
  }

  if (provMeta.error) {
    entries.push({
      level: 'error',
      time: provMeta.failed_at || provMeta.updated_at,
      message: provMeta.error,
    });
  }

  return entries;
}
