import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiUser, FiBriefcase, FiCalendar, FiMapPin, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { useEmployments, useDepartments, useUnits, usePositions } from '../../../hooks/structure';
import { StructureLoading, StructureConfirmDialog } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import EmployeeSelector from './EmployeeSelector';
import './employment.css';

export const EmploymentTransfer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    position_id: '',
    department_id: '',
    unit_id: '',
    effective_date: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  const { transfer, isLoading, error, clearError, items: employments, fetchAll: fetchEmployments } = useEmployments({ autoFetch: false });
  const { items: departments, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });
  const { items: units, fetchAll: fetchUnits } = useUnits({ autoFetch: false });
  const { items: positions, fetchAll: fetchPositions } = usePositions({ autoFetch: false });

  useEffect(() => {
    fetchEmployments({ page_size: 1000, is_current: 'true' });
    fetchDepartments({ page_size: 1000 });
    fetchUnits({ page_size: 1000 });
    fetchPositions({ page_size: 1000 });
  }, [fetchEmployments, fetchDepartments, fetchUnits, fetchPositions]);

  const handleEmployeeChange = useCallback((userId, empObj) => {
    setSelectedEmployee(empObj);
    setFormData((prev) => ({
      ...prev,
      user_id: userId,
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto-populate department & unit if position is chosen
      if (name === 'position_id' && value) {
        const selectedPos = positions?.find((p) => String(p.id) === String(value));
        if (selectedPos) {
          if (selectedPos.department_id) next.department_id = selectedPos.department_id;
          if (selectedPos.unit_id) next.unit_id = selectedPos.unit_id;
        }
      }

      return next;
    });
  }, [positions]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.position_id || !formData.effective_date) {
      return;
    }
    setShowConfirm(true);
  }, [formData]);

  const handleConfirmTransfer = useCallback(async () => {
    setIsSubmitting(true);
    setShowConfirm(false);
    try {
      const result = await transfer({
        user_id: formData.user_id,
        position_id: formData.position_id,
        department_id: formData.department_id || undefined,
        unit_id: formData.unit_id || undefined,
        effective_date: formData.effective_date,
        reason: formData.reason,
      });
      setTransferResult(result);
      setTimeout(() => {
        navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
      }, 2000);
    } catch (err) {
      console.error('Transfer failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, transfer, navigate]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.EMPLOYMENTS);
  }, [navigate]);

  const handleReset = useCallback(() => {
    setFormData({
      user_id: '',
      position_id: '',
      department_id: '',
      unit_id: '',
      effective_date: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setSelectedEmployee(null);
    setTransferResult(null);
    clearError();
  }, [clearError]);

  const selectedPositionObj = useMemo(() => {
    return positions?.find((p) => String(p.id) === String(formData.position_id));
  }, [positions, formData.position_id]);

  const employeeDisplayName = useMemo(() => {
    if (!selectedEmployee) return 'Selected Employee';
    return selectedEmployee.user_name || `${selectedEmployee.user_first_name || ''} ${selectedEmployee.user_last_name || ''}`.trim() || 'Employee';
  }, [selectedEmployee]);

  const newPositionTitle = useMemo(() => {
    return selectedPositionObj?.title || 'Selected Position';
  }, [selectedPositionObj]);

  if (isLoading || isSubmitting) {
    return (
      <div className="employment-transfer-loading">
        <StructureLoading text={isSubmitting ? 'Processing transfer...' : 'Loading workforce directory...'} />
      </div>
    );
  }

  if (transferResult) {
    return (
      <div className="employment-transfer-success">
        <div className="success-icon">✓</div>
        <h2>Transfer Successful!</h2>
        <p><strong>{employeeDisplayName}</strong> has been transferred successfully to <strong>{newPositionTitle}</strong>.</p>
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-label">Employee:</span>
            <span className="detail-value">{employeeDisplayName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">New Position:</span>
            <span className="detail-value">{newPositionTitle}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Effective Date:</span>
            <span className="detail-value">{new Date(formData.effective_date).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={handleReset} className="btn btn-primary">
          Transfer Another Employee
        </button>
      </div>
    );
  }

  return (
    <div className="employment-transfer-container">
      <div className="employment-transfer-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back to Employments
        </button>
        <h1>Transfer Employee</h1>
      </div>

      <div className="employment-transfer-body">
        <form onSubmit={handleSubmit} className="transfer-form">
          {/* Section 1: Employee Selection */}
          <div className="form-section">
            <h3>1. Select Employee</h3>
            <div className="form-group">
              <label htmlFor="user_id">
                Employee Name <span className="required">*</span>
              </label>
              <EmployeeSelector
                value={formData.user_id}
                onChange={handleEmployeeChange}
                employments={employments || []}
                placeholder="Search and select employee by name..."
              />
              <span className="form-hint">Select the team member you wish to transfer</span>
            </div>

            {/* Current Employment Card */}
            {selectedEmployee && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      {(selectedEmployee.user_name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{employeeDisplayName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedEmployee.user_email || 'No email registered'}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FiCheckCircle size={12} /> Current Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Current Position</span>
                    <strong style={{ color: '#1e293b' }}>{selectedEmployee.position_title || 'Position not set'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Current Department</span>
                    <strong style={{ color: '#1e293b' }}>{selectedEmployee.department_name || 'General / Unassigned'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Current Division</span>
                    <strong style={{ color: '#1e293b' }}>{selectedEmployee.division_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Employment Type</span>
                    <strong style={{ color: '#1e293b', textTransform: 'capitalize' }}>{selectedEmployee.employment_type || 'Permanent'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: New Assignment */}
          <div className="form-section">
            <h3>2. New Assignment</h3>
            <div className="form-group">
              <label htmlFor="position_id">
                New Position <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FiBriefcase className="input-icon" size={16} />
                <select
                  id="position_id"
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select target position...</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title || position.job_code} {position.department_name ? `(${position.department_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <span className="form-hint">Choose the destination role for this employee</span>
            </div>

            <div className="form-group">
              <label htmlFor="department_id">New Department (Optional override)</label>
              <div className="input-with-icon">
                <FiLayers className="input-icon" size={16} />
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  <option value="">Auto-derive from Position (or select department)</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="unit_id">New Team / Unit (Optional)</label>
              <div className="input-with-icon">
                <FiMapPin className="input-icon" size={16} />
                <select
                  id="unit_id"
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleChange}
                >
                  <option value="">Select unit (optional)</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="effective_date">
                Effective Date <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FiCalendar className="input-icon" size={16} />
                <input
                  id="effective_date"
                  name="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <span className="form-hint">Date when this transfer takes effect</span>
            </div>
          </div>

          {/* Section 3: Transfer Details */}
          <div className="form-section">
            <h3>3. Transfer Details & Justification</h3>
            <div className="form-group">
              <label htmlFor="reason">Reason for Transfer</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Provide details or justification for this transfer (e.g., Department reorganization, promotion, cross-functional rotation)..."
                rows="4"
                value={formData.reason}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="transfer-error">
              <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
              <button type="button" onClick={clearError} className="btn btn-secondary">
                Dismiss
              </button>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              <FiRefreshCw size={16} />
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.user_id || !formData.position_id}
            >
              Transfer Employee
            </button>
          </div>
        </form>
      </div>

      <StructureConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmTransfer}
        title="Confirm Employee Transfer"
        message={`Are you sure you want to transfer ${employeeDisplayName} to ${newPositionTitle}? This will update their active role and create an immutable record in their employment history.`}
        type="warning"
        confirmLabel="Confirm & Transfer"
      />
    </div>
  );
};

export default EmploymentTransfer;

