export const selectEncryptionKeys = (state) => state.configEncryption?.keys || [];
export const selectCurrentEncryptionKey = (state) => state.configEncryption?.currentKey;
export const selectDefaultEncryptionKey = (state) => state.configEncryption?.defaultKey;
export const selectKeysNeedingRotation = (state) => state.configEncryption?.keysNeedingRotation || [];
export const selectEncryptionStats = (state) => state.configEncryption?.stats || {};
export const selectEncryptionFilters = (state) => state.configEncryption?.filters || {};
export const selectEncryptionPagination = (state) => state.configEncryption?.pagination || {};
export const selectEncryptionLoading = (state) => state.configEncryption?.loading || false;
export const selectEncryptionError = (state) => state.configEncryption?.error;

export const selectActiveEncryptionKeys = (state) => selectEncryptionKeys(state).filter(k => k.key_status === 'active');
export const selectCompromisedKeys = (state) => selectEncryptionKeys(state).filter(k => k.key_status === 'compromised');
export const selectDefaultKeyId = (state) => selectDefaultEncryptionKey(state)?.id;
export const selectIsEncryptionHealthy = (state) => {
  const defaultKey = selectDefaultEncryptionKey(state);
  return defaultKey && defaultKey.key_status === 'active';
};