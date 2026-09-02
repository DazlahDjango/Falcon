import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCheck, FiXCircle, FiClock, FiUser, FiTarget } from 'react-icons/fi';
import {
  fetchPendingKPIApprovals,
  approveKPI,
  rejectKPI,
  selectPendingKPIApprovals,
  selectKPISubmitting
} from '../../../../store/kpi';

const KPIPendingApprovalsModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const pendingItems = useSelector(selectPendingKPIApprovals) || [];
  const submitting = useSelector(selectKPISubmitting);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    dispatch(fetchPendingKPIApprovals());
  }, [dispatch]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveKPI(id)).unwrap();
    } catch (err) {
      console.error('Failed to approve KPI:', err);
    }
  };

  const handleRejectSubmit = async (id) => {
    try {
      await dispatch(rejectKPI({ id, reason: rejectReason })).unwrap();
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject KPI:', err);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b'
            }}>
              <FiClock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                Pending Staff KPI Approvals
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Review operational KPIs proposed by direct reports
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {pendingItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <FiCheck size={40} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>All Clear!</h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>No staff-created KPIs awaiting approval.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingItems.map((item) => (
                <div key={item.id} style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#fef3c7',
                      color: '#d97706'
                    }}>
                      PENDING
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '1rem',
                    fontSize: '0.825rem', color: '#475569',
                    paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiUser size={13} color="#64748b" /> Owner: <strong>{item.owner_email || item.owner_name || 'Staff'}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiTarget size={13} color="#64748b" /> Type: <strong>{item.kpi_type}</strong> ({item.unit})
                    </span>
                    {item.baseline !== null && item.baseline !== undefined && (
                      <span>Baseline: <strong>{item.baseline}</strong></span>
                    )}
                  </div>

                  {/* Reject Reason Textarea Inline */}
                  {rejectingId === item.id ? (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.25rem' }}>
                        Rejection Reason (Feedback for staff):
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        placeholder="Explain why this KPI requires adjustment..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectSubmit(item.id)}
                          disabled={submitting}
                          style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => setRejectingId(item.id)}
                        disabled={submitting}
                        style={{
                          padding: '0.45rem 0.95rem',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fff5f5',
                          color: '#dc2626',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.35rem'
                        }}
                      >
                        <FiXCircle size={14} /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        disabled={submitting}
                        style={{
                          padding: '0.45rem 1.1rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.35rem'
                        }}
                      >
                        <FiCheck size={14} /> Approve KPI
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPIPendingApprovalsModal;
