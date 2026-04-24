import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { acceptInvitation } from '../../../services/accounts/api/auth';
import PasswordStrength from '../../common/Forms/PasswordStrength';
import Spinner from '../../common/UI/Spinner';

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Check if token exists
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            await acceptInvitation({ 
                token, 
                first_name: formData.firstName,
                last_name: formData.lastName,
                password: formData.password
            });
            setSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setErrors({ general: err.response?.data?.error || 'Failed to accept invitation' });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Success screen after submission
    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-header-text">
                    <h2>Welcome to Falcon PMS!</h2>
                    <p>Your account has been created successfully</p>
                </div>
                
                <div className="auth-success-message">
                    <FiCheckCircle size={48} className="success-icon" />
                    <p>You will be redirected to login shortly...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Accept Invitation</h2>
                <p>Complete your account setup</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
                {/* Rest of your form remains the same */}
                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`form-input ${errors.firstName ? 'is-invalid' : ''}`}
                        />
                        {errors.firstName && (
                            <div className="input-feedback error">{errors.firstName}</div>
                        )}
                    </div>
                    <div className="form-group half">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`form-input ${errors.lastName ? 'is-invalid' : ''}`}
                        />
                        {errors.lastName && (
                            <div className="input-feedback error">{errors.lastName}</div>
                        )}
                    </div>
                </div>
                
                {/* Password fields remain the same */}
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
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <div className="input-feedback error">{errors.password}</div>
                    )}
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
                            required
                        />
                    </div>
                    {errors.confirmPassword && (
                        <div className="input-feedback error">{errors.confirmPassword}</div>
                    )}
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner size="sm" /> : 'Create Account'}
                </button>
            </form>
        </div>
    );
};

export default AcceptInvitation;