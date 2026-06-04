import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';
import Spinner from '../../common/UI/Spinner';

const PasswordChangeForm = ({ onClose }) => {
    const { changeUserPassword, isLoading } = useProfile();

    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        score: 0
    });
    const [success, setSuccess] = useState(false);

    const checkPasswordStrength = (password) => {
        const strength = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            score: 0
        };

        let score = 0;
        if (strength.length) score++;
        if (strength.uppercase) score++;
        if (strength.lowercase) score++;
        if (strength.number) score++;
        if (strength.special) score++;
        strength.score = score;

        setPasswordStrength(strength);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'new_password') {
            checkPasswordStrength(value);
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
        } else if (passwordStrength.score < 3) {
            newErrors.new_password = 'Password is too weak. Please use a stronger password';
        }
        if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }
        if (formData.old_password === formData.new_password) {
            newErrors.new_password = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await changeUserPassword(formData.old_password, formData.new_password);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to change password' });
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength.score <= 1) return '#dc2626';
        if (passwordStrength.score <= 3) return '#f59e0b';
        return '#10b981';
    };

    const getStrengthText = () => {
        if (passwordStrength.score <= 1) return 'Weak';
        if (passwordStrength.score <= 3) return 'Medium';
        return 'Strong';
    };

    if (success) {
        return (
            <div className="password-change-success">
                <FiCheckCircle size={48} />
                <h3>Password Changed Successfully!</h3>
                <p>Your password has been updated. You'll be redirected shortly.</p>
            </div>
        );
    }

    return (
        <div className="password-change-form">
            <div className="form-header">
                <h3>Change Password</h3>
                <button className="close-btn" onClick={onClose}>
                    <FiXCircle size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPasswords.old ? "text" : "password"}
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            className={`form-input ${errors.old_password ? 'is-invalid' : ''}`}
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => togglePasswordVisibility('old')}
                        >
                            {showPasswords.old ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    {errors.old_password && <div className="input-feedback error">{errors.old_password}</div>}
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className={`form-input ${errors.new_password ? 'is-invalid' : ''}`}
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    {errors.new_password && <div className="input-feedback error">{errors.new_password}</div>}
                </div>

                {/* Password Strength Meter */}
                {formData.new_password && (
                    <div className="password-strength">
                        <div className="strength-meter">
                            <div
                                className="strength-fill"
                                style={{
                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                    backgroundColor: getStrengthColor()
                                }}
                            />
                        </div>
                        <div className="strength-text" style={{ color: getStrengthColor() }}>
                            Password Strength: {getStrengthText()}
                        </div>
                        <div className="strength-criteria">
                            <div className={`criteria ${passwordStrength.length ? 'met' : ''}`}>
                                {passwordStrength.length ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                At least 8 characters
                            </div>
                            <div className={`criteria ${passwordStrength.uppercase ? 'met' : ''}`}>
                                {passwordStrength.uppercase ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                Uppercase letter
                            </div>
                            <div className={`criteria ${passwordStrength.lowercase ? 'met' : ''}`}>
                                {passwordStrength.lowercase ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                Lowercase letter
                            </div>
                            <div className={`criteria ${passwordStrength.number ? 'met' : ''}`}>
                                {passwordStrength.number ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                Number
                            </div>
                            <div className={`criteria ${passwordStrength.special ? 'met' : ''}`}>
                                {passwordStrength.special ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                Special character
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className={`form-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                    {errors.confirm_password && <div className="input-feedback error">{errors.confirm_password}</div>}
                </div>

                {errors.submit && (
                    <div className="alert alert-error">
                        <FiAlertCircle size={16} />
                        {errors.submit}
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChangeForm;