export const selectSystemSettingsState = (state) => state.billing?.systemSettings || {};

export const selectSettings = (state) => selectSystemSettingsState(state).settings;
export const selectSettingsLoading = (state) => selectSystemSettingsState(state).loading;
export const selectSettingsError = (state) => selectSystemSettingsState(state).error;
export const selectSettingsVersion = (state) => selectSystemSettingsState(state).version;
export const selectSettingsLastFetched = (state) => selectSystemSettingsState(state).lastFetched;
export const selectEffectiveSettings = (state) => selectSettings(state)?.effective_settings || selectSettings(state)?.settings || {};
export const selectTaxRates = (state) => selectEffectiveSettings(state).tax_rates || {};
export const selectGracePeriodDays = (state) => selectEffectiveSettings(state).grace_period_days || 7;
export const selectSuspensionDays = (state) => selectEffectiveSettings(state).suspension_days || 30;
export const selectPaymentRetryAttempts = (state) => selectEffectiveSettings(state).payment_retry_attempts || 3;
export const selectSoftLimitPercentage = (state) => selectEffectiveSettings(state).soft_limit_percentage || 100;
export const selectHardLimitPercentage = (state) => selectEffectiveSettings(state).hard_limit_percentage || 110;
export const selectInvoicePrefix = (state) => selectEffectiveSettings(state).invoice_prefix || 'FALCON-';
export const selectInvoiceDueDays = (state) => selectEffectiveSettings(state).invoice_due_days || 7;
export const selectWebhookRetryMaxAttempts = (state) => selectEffectiveSettings(state).webhook_retry_max_attempts || 3;
export const selectWebhookRetryBaseDelayMinutes = (state) => selectEffectiveSettings(state).webhook_retry_base_delay_minutes || 5;