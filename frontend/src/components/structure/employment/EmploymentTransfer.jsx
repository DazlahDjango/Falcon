import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiUser, FiBriefcase, FiCalendar, FiSearch } from 'react-icons/fi';
import { useEmployments, useDepartments, useUnits, usePositions } from '../../../hooks/structure';
import { StructureLoading, StructureStatusBadge, StructureConfirmDialog } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [userSearch, setUserSearch] = useState('');

  const { transfer, isLoading, error, clearError } = useEmployments({ autoFetch: false });
  const { items: departments, fetchAll: fetchDepartments } = useDepartments({ autoFetch: false });
  const { items: units, fetchAll: fetchUnits } = useUnits({ autoFetch: false });
  const { items: positions, fetchAll: fetchPositions } = usePositions({ autoFetch: false });

  useEffect(() => {
    fetchDepartments({ page_size: 1000 });
    fetchUnits({ page_size: 1000 });
    fetchPositions({ page_size: 1000 });
  }, [fetchDepartments, fetchUnits, fetchPositions]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

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
    setTransferResult(null);
    clearError();
  }, [clearError]);

  if (isLoading || isSubmitting) {
    return (
      <div className="employment-transfer-loading">
        <StructureLoading text={isSubmitting ? 'Processing transfer...' : 'Loading...'} />
      </div>
    );
  }

  if (transferResult) {
    return (
      <div className="employment-transfer-success">
        <div className="success-icon">✓</div>
        <h2>Transfer Successful!</h2>
        <p>Employee has been transferred successfully.</p>
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-label">New Employment ID:</span>
            <span className="detail-value">{transferResult.new_employment_id}</span>
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
          Back
        </button>
        <h1>Transfer Employee</h1>
      </div>

      <div className="employment-transfer-body">
        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-section">
            <h3>Employee Information</h3>
            <div className="form-group">
              <label htmlFor="user_id">
                User ID <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <FiUser className="input-icon" size={16} />
                <input
                  id="user_id"
                  name="user_id"
                  type="text"
                  placeholder="Enter user ID to transfer"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <span className="form-hint">The user ID of the employee to transfer</span>
            </div>
          </div>

          <div className="form-section">
            <h3>New Assignment</h3>
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
                  <option value="">Select position</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title || position.job_code || position.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="department_id">New Department</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name || department.code || department.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit_id">New Unit</label>
              <select
                id="unit_id"
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChange}
                disabled={!formData.department_id}
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name || unit.code || unit.id}
                  </option>
                ))}
              </select>
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
            </div>
          </div>

          <div className="form-section">
            <h3>Transfer Details</h3>
            <div className="form-group">
              <label htmlFor="reason">Reason for Transfer</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Provide a reason for this transfer..."
                rows="4"
                value={formData.reason}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="transfer-error">
              <p>{error}</p>
              <button onClick={clearError} className="btn btn-secondary">
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              Transfer Employee
            </button>
          </div>
        </form>
      </div>

      <StructureConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmTransfer}
        title="Confirm Transfer"
        message={`Are you sure you want to transfer employee ${formData.user_id} to position ${formData.position_id}?`}
        type="warning"
        confirmLabel="Confirm Transfer"
      />
    </div>
  );
};

export default EmploymentTransfer;