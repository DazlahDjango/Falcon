import { createSelector } from '@reduxjs/toolkit';

const selectWebhookState = (state) => state.billing?.webhook || {};

export const selectWebhookLogs = createSelector([selectWebhookState], (webhook) => webhook.logs || []);
export const selectSelectedWebhookLog = createSelector([selectWebhookState], (webhook) => webhook.selectedLog);
export const selectWebhookPagination = createSelector([selectWebhookState], (webhook) => webhook.pagination);
export const selectWebhookLoading = createSelector([selectWebhookState], (webhook) => webhook.loading);
export const selectWebhookError = createSelector([selectWebhookState], (webhook) => webhook.error);
export const selectWebhookStats = createSelector([selectWebhookState], (webhook) => webhook.stats);

export const selectProcessedWebhooks = createSelector([selectWebhookLogs], (logs) => logs.filter(l => l.processing_status === 'processed'));
export const selectFailedWebhooks = createSelector([selectWebhookLogs], (logs) => logs.filter(l => l.processing_status === 'failed'));
export const selectPendingWebhooks = createSelector([selectWebhookLogs], (logs) => logs.filter(l => l.processing_status === 'pending'));
export const selectWebhookSuccessRate = createSelector([selectWebhookStats], (stats) => stats?.success_rate || 0);
export const selectWebhookByEventType = (eventType) => createSelector([selectWebhookLogs], (logs) => logs.filter(l => l.event_type === eventType));