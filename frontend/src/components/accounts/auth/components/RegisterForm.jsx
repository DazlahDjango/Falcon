import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { PasswordStrength } from '../../../common/Forms/PasswordStrength';
import { Spinner } from '../../../common/UI/Spinner';
const RegisterForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: value }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.username) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
                <div className="form-group half">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group half">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                        autoComplete="email"
                    />
                </div>
                {errors.email && <div className="input-feedback error">{errors.email}</div>}
            </div>
            
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                        autoComplete="username"
                    />
                </div>
                {errors.username && <div className="input-feedback error">{errors.username}</div>}
            </div>
            
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>
                {errors.password && <div className="input-feedback error">{errors.password}</div>}
            </div>
            
            <PasswordStrength password={formData.password} />
            
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        autoComplete="new-password"
                    />
                </div>
                {errors.confirmPassword && <div className="input-feedback error">{errors.confirmPassword}</div>}
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
        </form>
    );
};
export { RegisterForm };