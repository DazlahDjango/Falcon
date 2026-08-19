import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiMail,
  FiUser,
  FiShield,
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { USER_ROLES } from '../../../config/constants/accountsApiConstants';

export const UserInviteForm = ({ onClose, onSuccess }) => {
  const { sendInvitation, isLoading } = useUsers();
  const { assignableRoles } = useRoles();

  const [formData, setFormData] = useState({
    email: '',
    role: USER_ROLES.STAFF,
    message: '',
    department_id: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (!formData.email) {
      setFormError('Email is required');
      return;
    }

    if (!formData.role) {
      setFormError('Role is required');
      return;
    }

    try {
      const payload = {
        email: formData.email,
        role: formData.role,
        ...(formData.message && { message: formData.message }),
        ...(formData.department_id && { department_id: formData.department_id }),
      };
      const result = await sendInvitation(payload);
      if (result.success !== false) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        setFormError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to send invitation');
    }
  };

  const roleOptions = assignableRoles.length > 0
    ? assignableRoles
    : Object.entries(USER_ROLES).map(([key, value]) => ({
        code: value,
        name: value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }));

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-body">
            <FiCheckCircle className="success-icon" />
            <h3>Invitation Sent!</h3>
            <p>An invitation has been sent to <strong>{formData.email}</strong></p>
            <p className="text-muted">They will receive an email with instructions to join.</p>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite User</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {formError && (
          <div className="modal-alert error">
            <FiAlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${submitted && !formData.email ? 'error' : ''}`}
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            {submitted && !formData.email && (
              <span className="form-error">Email is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <div className="form-input-wrapper">
              <FiShield className="input-icon" />
              <select
                id="role"
                name="role"
                className={`form-select ${submitted && !formData.role ? 'error' : ''}`}
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                {roleOptions.map((role) => (
                  <option key={role.code || role} value={role.code || role}>
                    {role.name || role}
                  </option>
                ))}
              </select>
            </div>
            {submitted && !formData.role && (
              <span className="form-error">Role is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Personal Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              placeholder="Add a personal message to the invitation..."
              value={formData.message}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend /> Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserInviteForm;