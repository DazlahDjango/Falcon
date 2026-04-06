import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { changePassword } from '../../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import PasswordStrength from '../../../common/Forms/PasswordStrength';

const PasswordChange = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.old_password) {
            newErrors.old_password = 'Current password is required';
        }
        if (!formData.new_password) {
            newErrors.new_password = 'New password is required';
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters';
        }
        if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await dispatch(changePassword(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Password changed successfully' }));
            setFormData({ old_password: '', new_password: '', confirm_password: ''});
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to change password' }));
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="password-change-form">
            <div className="form-group">
                <label>Current Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        className={`form-input ${errors.old_password ? 'is-invalid' : ''}`}
                    />
                </div>
                {errors.old_password && <div className="input-feedback error">{errors.old_password}</div>}
            </div>
            
            <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        className={`form-input ${errors.new_password ? 'is-invalid' : ''}`}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPasswords(!showPasswords)}
                    >
                        {showPasswords ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>
                {errors.new_password && <div className="input-feedback error">{errors.new_password}</div>}
            </div>
            
            <PasswordStrength password={formData.new_password} />
            
            <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`form-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                    />
                </div>
                {errors.confirm_password && <div className="input-feedback error">{errors.confirm_password}</div>}
            </div>
            
            <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                {isLoading ? 'Changing...' : 'Change Password'}
            </button>
        </form>
    );
};
export default PasswordChange;