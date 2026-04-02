import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Spinner } from '../../../common/UI/Spinner';

const LoginForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };
    return (
        <form onSubmit={handleSubmit} className="auth-form">
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
                        placeholder="Enter your email"
                        className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                        autoComplete="email"
                        autoFocus
                    />
                </div>
                {errors.email && <div className="input-feedback error">{errors.email}</div>}
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
                        placeholder="Enter your password"
                        className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                        autoComplete="current-password"
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
            
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
        </form>
    );
};
export { LoginForm };