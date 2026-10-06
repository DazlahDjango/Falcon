// src/components/reviews/feedback/requests/AutoAssignFeedbackModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Building, 
  ArrowRightLeft, 
  Network, 
  Globe, 
  Calendar, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Eye,
  Lock
} from 'lucide-react';
import { useFeedback, useCycles } from '../../../../hooks/reviews';
import { useDepartments } from '../../../../hooks/structure';

const STRATEGIES = [
  {
    id: 'intra_department',
    title: 'Intra-Department',
    icon: Building,
    desc: 'All members of a selected department review all other colleagues in that same department.'
  },
  {
    id: 'all_departments',
    title: 'All Departments (Intra)',
    icon: Network,
    desc: 'Automatically run department-level peer reviews across every department in the company.'
  },
  {
    id: 'cross_department',
    title: 'Cross-Department',
    icon: ArrowRightLeft,
    desc: 'Department A evaluates Department B (e.g. Product evaluates Engineering).'
  },
  {
    id: 'organization_wide',
    title: 'Organization-Wide',
    icon: Globe,
    desc: 'Company-wide all-to-all reviews, or random sampling of N peers per employee.'
  },
  {
    id: 'reporting_line',
    title: 'Reporting Hierarchy (360)',
    icon: Users,
    desc: 'Manager reviews direct reports, reports review manager (upward), and team peers review each other.'
  }
];

const AutoAssignFeedbackModal = ({ isOpen, onClose, onSuccess }) => {
  const { autoAssign } = useFeedback();
  const { data: cyclesData, fetchAll: fetchCycles } = useCycles();
  const { items: departments, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });

  const [strategy, setStrategy] = useState('intra_department');
  const [cycleId, setCycleId] = useState('');
  const [department, setDepartment] = useState('');
  const [sourceDepartment, setSourceDepartment] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [bidirectional, setBidirectional] = useState(true);
  const [sampleSize, setSampleSize] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isRequired, setIsRequired] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (typeof fetchCycles === 'function') fetchCycles();
      if (typeof fetchDepartments === 'function') fetchDepartments();
    }
  }, [isOpen, fetchCycles, fetchDepartments]);

  useEffect(() => {
    if (cyclesData && cyclesData.length > 0 && !cycleId) {
      const active = cyclesData.find(c => c.status === 'active' || c.status === 'in_progress') || cyclesData[0];
      if (active) {
        setCycleId(active.id);
        if (active.end_date) {
          setDueDate(active.end_date);
        }
      }
    }
  }, [cyclesData, cycleId]);

  if (!isOpen) return null;

  const buildPayload = (dryRun = false) => {
    return {
      cycle_id: parseInt(cycleId, 10),
      strategy,
      department: strategy === 'intra_department' ? department : undefined,
      source_department: strategy === 'cross_department' ? sourceDepartment : undefined,
      target_department: strategy === 'cross_department' ? targetDepartment : undefined,
      bidirectional: strategy === 'cross_department' ? bidirectional : undefined,
      sample_size: strategy === 'organization_wide' && sampleSize ? parseInt(sampleSize, 10) : undefined,
      due_date: dueDate || undefined,
      is_anonymous: isAnonymous,
      is_required: isRequired,
      dry_run: dryRun
    };
  };

  const handlePreview = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!cycleId) {
      setErrorMsg('Please select a Review Cycle');
      return;
    }
    if (strategy === 'intra_department' && !department) {
      setErrorMsg('Please select or specify a Department');
      return;
    }
    if (strategy === 'cross_department' && (!sourceDepartment || !targetDepartment)) {
      setErrorMsg('Please select both Source and Target Departments');
      return;
    }

    setPreviewLoading(true);
    try {
      const actionResult = await autoAssign(buildPayload(true));
      const res = actionResult?.payload || actionResult;
      if (res && !res.error) {
        setPreviewData(res);
      } else {
        setErrorMsg(res?.error || 'Failed to generate preview');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error generating preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!cycleId) {
      setErrorMsg('Please select a Review Cycle');
      return;
    }
    if (strategy === 'intra_department' && !department) {
      setErrorMsg('Please select or specify a Department');
      return;
    }
    if (strategy === 'cross_department' && (!sourceDepartment || !targetDepartment)) {
      setErrorMsg('Please select both Source and Target Departments');
      return;
    }

    setSubmitting(true);
    try {
      const actionResult = await autoAssign(buildPayload(false));
      const res = actionResult?.payload || actionResult;
      if (res && !res.error) {
        setSuccessMsg(res.message || `Successfully generated ${res.created_count} feedback requests!`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res?.error || 'Failed to create feedback requests');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error generating feedback requests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#eff6ff',
              color: '#2563eb',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Auto-Assign 360° Feedback
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Automatically generate peer, subordinate, and cross-department feedback pairings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#047857',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          {/* 1. Review Cycle Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Select Review Cycle <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={cycleId}
              onChange={(e) => setCycleId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#fff'
              }}
            >
              <option value="">-- Choose Review Cycle --</option>
              {cyclesData?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.start_date} → {c.end_date})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Strategy Selector Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Choose Assignment Strategy <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {STRATEGIES.map((s) => {
                const isSelected = strategy === s.id;
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    onClick={() => { setStrategy(s.id); setPreviewData(null); }}
                    style={{
                      padding: '0.85rem',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#fff',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Icon size={18} color={isSelected ? '#2563eb' : '#64748b'} />
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? '#1e40af' : '#1e293b' }}>
                        {s.title}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Strategy-Specific Config */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {strategy === 'intra_department' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Target Department <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setPreviewData(null); }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Choose Department --</option>
                  {departments?.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Customer Operations">Customer Operations</option>
                </select>
              </div>
            )}

            {strategy === 'cross_department' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Source Department (Reviewers)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Product Management"
                    value={sourceDepartment}
                    onChange={(e) => { setSourceDepartment(e.target.value); setPreviewData(null); }}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Department (Subjects)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineering"
                    value={targetDepartment}
                    onChange={(e) => { setTargetDepartment(e.target.value); setPreviewData(null); }}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bidirectional}
                      onChange={(e) => { setBidirectional(e.target.checked); setPreviewData(null); }}
                    />
                    <strong>Bidirectional Pairing:</strong> Both departments review each other mutually.
                  </label>
                </div>
              </div>
            )}

            {strategy === 'organization_wide' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Peer Sample Size (Leave empty for full all-to-all company matrix)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="e.g. 3 random peers per employee"
                  value={sampleSize}
                  onChange={(e) => { setSampleSize(e.target.value); setPreviewData(null); }}
                  style={{ width: '220px', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}

            {strategy === 'all_departments' && (
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                ⚡ This will iterate through <strong>every department</strong> in your organization and generate intra-department peer evaluations for all colleagues in each team.
              </p>
            )}

            {strategy === 'reporting_line' && (
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                ⚡ This will map the manager reporting chain: <strong>direct reports review manager (upward)</strong>, <strong>manager reviews reports (downward)</strong>, and <strong>reports review each other (team peer)</strong>.
              </p>
            )}

            {/* Common Settings: Due date, Anonymous, Required */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Feedback Deadline
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>🔒 <strong>Anonymous Feedback</strong></span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                  />
                  <span>Mandatory submission</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Preview Data Box */}
          {previewData && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#166534', fontSize: '0.95rem' }}>
                  ✓ Preview: {previewData.created_count} New Requests will be created
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#15803d' }}>
                  ({previewData.skipped_count} existing requests skipped)
                </span>
              </div>
              {previewData.pairs && previewData.pairs.length > 0 && (
                <div style={{ maxHeight: '140px', overflowY: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #dcfce7', fontSize: '0.8rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                      <tr>
                        <th style={{ padding: '6px 8px' }}>Subject</th>
                        <th style={{ padding: '6px 8px' }}>Reviewer</th>
                        <th style={{ padding: '6px 8px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.pairs.slice(0, 10).map((p, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 500 }}>{p.subject_name}</td>
                          <td style={{ padding: '6px 8px' }}>{p.reviewer_name}</td>
                          <td style={{ padding: '6px 8px', textTransform: 'capitalize' }}>{p.reviewer_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Eye size={15} /> {previewLoading ? 'Calculating...' : 'Preview Pairings'}
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.55rem 1rem',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                background: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Sparkles size={16} /> {submitting ? 'Generating...' : 'Generate 360 Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoAssignFeedbackModal;
