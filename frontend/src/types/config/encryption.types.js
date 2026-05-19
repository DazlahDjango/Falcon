import PropTypes from 'prop-types';

export const EncryptionKeyType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  key_id: PropTypes.string,
  key_alias: PropTypes.string.isRequired,
  key_source: PropTypes.oneOf(['aws_kms', 'gcp_kms', 'azure_keyvault', 'hashicorp_vault', 'local_hsm']),
  key_status: PropTypes.oneOf(['active', 'inactive', 'compromised', 'expired', 'deleted']).isRequired,
  key_region: PropTypes.string,
  key_arn: PropTypes.string,
  is_default: PropTypes.bool,
  activated_at: PropTypes.string,
  rotated_at: PropTypes.string,
  expires_at: PropTypes.string,
  last_used_at: PropTypes.string,
  usage_count: PropTypes.number,
  rotated_by: PropTypes.string,
  rotation_reason: PropTypes.string,
  metadata: PropTypes.object,
  created_at: PropTypes.string
});