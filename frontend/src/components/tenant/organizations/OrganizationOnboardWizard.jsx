import React, { useState } from 'react';
import { FiCheck, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useOrganizations } from '../../../hooks/tenant';
import { sleep } from '../../../services/tenant/organization.utils';
import { getProvisioningMeta } from '../../../services/tenant';

const OrganizationOnboardWizard = ({ organizationId, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const { onboard, fetchStatus } = useOrganizations({ autoFetch: false });

  const pollProvisioning = async (orgId) => {
    const maxAttempts = 90;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await fetchStatus(orgId);
      const prov = getProvisioningMeta(status);
      const orgStatus = status?.status;

      setProgress(prov.progress ?? 0);
      setProgressMessage(prov.message || prov.step_name || 'Provisioning organization...');

      if (status?.is_onboarded || prov.status === 'COMPLETED' || orgStatus === 'ACTIVE') {
        return status;
      }
      if (orgStatus === 'FAILED' || prov.status === 'FAILED') {
        throw new Error(prov.error || 'Organization provisioning failed');
      }
      await sleep(2000);
    }
    throw new Error('Provisioning is taking longer than expected. Check the provisioning dashboard.');
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setStep(2);
    try {
      await onboard(organizationId);
      await pollProvisioning(organizationId);
      setProgress(100);
      setStep(3);
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Onboarding failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FiCheck size={32} style={{ color: '#16a34a' }} />
        </div>
        <h3 className="org-font-semibold" style={{ color: '#0f172a', fontSize: '18px' }}>Onboarding Complete</h3>
        <p className="org-text-sm org-text-muted org-mt-2">The organization is provisioned and ready to use.</p>
        <button type="button" className="org-btn org-btn-primary org-mt-4" onClick={onSuccess}>
          Done
        </button>
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Review' },
    { number: 2, label: 'Provision' },
    { number: 3, label: 'Complete' },
  ];

  return (
    <div>
      <div className="org-flex org-gap-2" style={{ marginBottom: '24px', justifyContent: 'center' }}>
        {steps.map((s) => (
          <div key={s.number} className="org-flex org-gap-2" style={{ alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                background: s.number <= step ? '#3b82f6' : '#e2e8f0',
                color: s.number <= step ? '#ffffff' : '#94a3b8',
              }}
            >
              {s.number < step ? <FiCheck size={16} /> : s.number}
            </div>
            <span className="org-text-xs org-text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="org-space-y-4">
          <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <p className="org-text-sm" style={{ color: '#0369a1' }}>This will provision the organization with:</p>
            <ul className="org-space-y-1 org-mt-2" style={{ listStyle: 'none', paddingLeft: '0' }}>
              <li className="org-text-sm" style={{ color: '#0369a1' }}>Database schema</li>
              <li className="org-text-sm" style={{ color: '#0369a1' }}>Resource limits (users, storage, API calls)</li>
              <li className="org-text-sm" style={{ color: '#0369a1' }}>Default roles and configuration</li>
              <li className="org-text-sm" style={{ color: '#0369a1' }}>Initial data seeding</li>
            </ul>
          </div>
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <div className="org-flex org-gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="org-btn org-btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="org-btn org-btn-primary" onClick={handleStart} disabled={loading}>
              Start Provisioning <FiArrowRight size={16} className="org-gap-2" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="org-space-y-4">
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <p className="org-text-sm" style={{ color: '#166534' }}>{progressMessage || 'Provisioning in progress...'}</p>
            <div className="org-mt-3" style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  height: '100%',
                  background: '#16a34a',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p className="org-text-xs org-text-muted org-mt-2">{progress}% complete</p>
          </div>
          <div className="org-flex org-gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="org-btn org-btn-primary" disabled>
              <FiLoader size={16} className="org-loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Provisioning...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationOnboardWizard;
