import React from 'react';

export const ReportAuditDetailModal = ({ isOpen, onClose, auditLog }) => {
  if (!isOpen || !auditLog) return null;

  return (
    <div className="reporting-modal-overlay">
      <div className="reporting-modal-content" style={{ maxWidth: 640 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#f8fafc' }}>
          Audit Log Record Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Action</div>
            <div style={{ fontWeight: 600, color: '#38bdf8' }}>{auditLog.action}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Sensitivity Level</div>
            <div style={{ fontWeight: 600, color: '#818cf8' }}>{auditLog.sensitivity_level}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Actor Email</div>
            <div>{auditLog.actor_email || 'System / Service'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>IP Address</div>
            <div style={{ fontFamily: 'monospace' }}>{auditLog.ip_address || '127.0.0.1'}</div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Action Metadata / JSON Payload</div>
          <pre
            style={{
              background: '#0f172a',
              padding: 12,
              borderRadius: 8,
              fontSize: 12,
              color: '#38bdf8',
              overflowX: 'auto',
              maxHeight: 200,
              margin: 0
            }}
          >
            {JSON.stringify(auditLog.details || {}, null, 2)}
          </pre>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="reporting-btn reporting-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportAuditDetailModal;
