import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiBriefcase,
  FiSave,
  FiAlertCircle,
} from 'react-icons/fi';
import { useUsers } from '../../../hooks/accounts/useUsers';
import { useRoles } from '../../../hooks/accounts/useRoles';
import { USER_ROLES } from '../../../config/constants/accountsApiConstants';

export const UserForm = ({ user, onClose, onSuccess, createUser: propsCreateUser, updateUser: propsUpdateUser, isLoading: propsIsLoading }) => {
  const { createUser: hookCreateUser, updateUser: hookUpdateUser, isLoading: hookIsLoading } = useUsers();
  const createUser = propsCreateUser || hookCreateUser;
  const updateUser = propsUpdateUser || hookUpdateUser;
  const isLoading = propsIsLoading ?? hookIsLoading;
  const { assignableRoles } = useRoles();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: USER_ROLES.STAFF,
    phone_number: '',
    department: '',
    title: '',
    employee_id: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || USER_ROLES.STAFF,
        phone_number: user.phone_number || '',
        department: user.department || '',
        title: user.title || '',
        employee_id: user.employee_id || '',
        password: '',
        password_confirm: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    const { email, username, first_name, last_name, role, phone_number, department, title, employee_id, password, password_confirm } = formData;

    if (!email || !username || !role) {
      setFormError('Email, username, and role are required');
      return;
    }

    if (!isEditing && (!password || !password_confirm)) {
      setFormError('Password is required for new users');
      return;
    }

    if (!isEditing && password !== password_confirm) {
      setFormError('Passwords do not match');
      return;
    }

    if (!isEditing && password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    const submitData = {
      email,
      username,
      first_name,
      last_name,
      role,
      phone_number,
      department,
      title,
      employee_id,
    };

    if (!isEditing) {
      submitData.password = password;
      submitData.password_confirm = password_confirm;
    }

    try {
      let result;
      if (isEditing) {
        result = await updateUser(user.id, submitData);
      } else {
        result = await createUser(submitData);
      }

      if (result.success !== false) {
        onSuccess && onSuccess(result);
      } else {
        setFormError(result.error || 'Failed to save user');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to save user');
    }
  };

  const roleOptions = assignableRoles.length > 0
    ? assignableRoles
    : Object.entries(USER_ROLES).map(([key, value]) => ({
        code: value,
        name: value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">First Name</label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="form-input"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <div className="form-input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

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
                disabled={isLoading || isEditing}
                required
              />
            </div>
            {submitted && !formData.email && (
              <span className="form-error">Email is required</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="form-input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className={`form-input ${submitted && !formData.username ? 'error' : ''}`}
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading || isEditing}
                required
              />
            </div>
            {submitted && !formData.username && (
              <span className="form-error">Username is required</span>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department</label>
              <div className="form-input-wrapper">
                <FiBriefcase className="input-icon" />
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="form-input"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Job Title</label>
              <div className="form-input-wrapper">
                <FiBriefcase className="input-icon" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone_number" className="form-label">Phone Number</label>
            <div className="form-input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                className="form-input"
                placeholder="+1 234 567 890"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="employee_id" className="form-label">Employee ID</label>
            <div className="form-input-wrapper">
              <FiBriefcase className="input-icon" />
              <input
                id="employee_id"
                name="employee_id"
                type="text"
                className="form-input"
                placeholder="EMP-001"
                value={formData.employee_id}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="form-input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${submitted && !formData.password ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {submitted && !formData.password && (
                  <span className="form-error">Password is required</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm" className="form-label">Confirm Password</label>
                <div className="form-input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${submitted && !formData.password_confirm ? 'error' : ''}`}
                    placeholder="Confirm password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                {submitted && !formData.password_confirm && (
                  <span className="form-error">Please confirm password</span>
                )}
                {submitted && formData.password && formData.password_confirm && formData.password !== formData.password_confirm && (
                  <span className="form-error">Passwords do not match</span>
                )}
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserForm;