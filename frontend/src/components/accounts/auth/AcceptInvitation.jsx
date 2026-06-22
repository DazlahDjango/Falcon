import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { acceptInvitation } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import PasswordStrength from '../../common/Forms/PasswordStrength';
import Spinner from '../../common/UI/Spinner';

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
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
            await dispatch(acceptInvitation({ 
                token, 
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password
            })).unwrap();
            setSubmitted(true);
            dispatch(showAlert({ type: 'success', message: 'Account created successfully!' }));
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err || 'Failed to accept invitation' }));
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`form-input ${errors.first_name ? 'is-invalid' : ''}`}
                        />
                        {errors.first_name && (
                            <div className="input-feedback error">{errors.first_name}</div>
                        )}
                    </div>
                    <div className="form-group half">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`form-input ${errors.last_name ? 'is-invalid' : ''}`}
                        />
                        {errors.last_name && (
                            <div className="input-feedback error">{errors.last_name}</div>
                        )}
                    </div>
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
                    <label htmlFor="confirm_password">Confirm Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className={`form-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                            required
                        />
                    </div>
                    {errors.confirm_password && (
                        <div className="input-feedback error">{errors.confirm_password}</div>
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