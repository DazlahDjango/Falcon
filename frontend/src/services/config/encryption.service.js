import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class EncryptionService extends BaseConfigService {
  constructor() {
    super('encryption-keys');
  }
  async getKeys(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.ENCRYPTION_KEYS, { params }));
  }
  async getKey(keyId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.ENCRYPTION_KEYS}/${keyId}/`));
  }
  async createKey(data) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.ENCRYPTION_KEYS, data));
  }
  async rotateKey(oldKeyId, newKeyAlias, keySource = 'aws_kms') {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.ROTATE_KEY, {
      old_key_id: oldKeyId, new_key_alias: newKeyAlias, key_source: keySource
    }));
  }
  async revokeKey(keyId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.REVOKE_KEY(keyId)));
  }
  async getDefaultKey() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DEFAULT_KEY));
  }
  async getKeysNeedingRotation() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.KEYS_NEEDING_ROTATION));
  }
  async getSecurityStats() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_SECURITY));
  }
}

export const encryptionService = new EncryptionService();