// components/tenant/domains/DomainVerifyModal.jsx
import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useDomains } from '../../../hooks/tenant';

const DomainVerifyModal = ({ domain, onClose, onSuccess }) => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const { verify, fetchOne } = useDomains({ autoFetch: false });

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    try {
      const result = await verify(domain.id);
      if (result?.data?.status === 'ACTIVE') {
        setVerified(true);
        const updated = await fetchOne(domain.id);
        if (onSuccess) onSuccess(updated);
      } else {
        setError(result?.data?.message || 'Verification failed. Please check your DNS settings.');
      }
    } catch (err) {
      setError(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = () => {
    const txtRecord = `falcon-domain-verification=${domain.verification_token}`;
    navigator.clipboard?.writeText(txtRecord);
  };

  const dnsRecord = domain?.verification_token ? `falcon-domain-verification=${domain.verification_token}` : '';

  return (
    <div className="domain-modal-overlay" onClick={onClose}>
      <div className="domain-modal" onClick={(e) => e.stopPropagation()}>
        <div className="domain-modal-header">
          <h3 className="domain-modal-title">Verify Domain</h3>
          <button className="domain-modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="domain-space-y-4">
          <div className="domain-flex domain-gap-2" style={{ alignItems: 'center' }}>
            <span className="domain-font-semibold" style={{ color: '#0f172a' }}>{domain?.domain}</span>
            <DomainStatusBadge status={domain?.status} />
          </div>

          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <p className="domain-text-sm" style={{ color: '#0369a1', fontWeight: 500 }}>Add this TXT record to your DNS:</p>
            <div className="domain-flex domain-gap-2 domain-mt-2" style={{ alignItems: 'center' }}>
              <code style={{
                background: '#e2e8f0',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                flex: 1,
                color: '#0f172a'
              }}>
                {dnsRecord}
              </code>
              <button className="domain-btn domain-btn-secondary domain-btn-sm" onClick={handleCopy} title="Copy">
                <FiCopy size={14} />
              </button>
            </div>
            <p className="domain-text-xs domain-text-muted domain-mt-2">
              Type: TXT | Name: @ or {domain?.domain} | Value: {dnsRecord}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}

          {verified ? (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <FiCheck size={24} style={{ margin: '0 auto 8px' }} />
              <p className="domain-font-semibold">Domain Verified Successfully!</p>
              <p className="domain-text-sm domain-text-muted">SSL certificate has been issued</p>
            </div>
          ) : (
            <div className="domain-flex domain-gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="domain-btn domain-btn-secondary" onClick={onClose} disabled={verifying}>
                Cancel
              </button>
              <button className="domain-btn domain-btn-primary" onClick={handleVerify} disabled={verifying}>
                {verifying ? (
                  <>
                    <span className="domain-loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', display: 'inline-block', marginRight: '8px' }}></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiRefreshCw size={14} style={{ marginRight: '6px' }} />
                    Verify Domain
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainVerifyModal;