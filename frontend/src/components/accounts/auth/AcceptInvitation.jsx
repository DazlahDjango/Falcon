import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { acceptInvitation } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';
import { invitationApi } from '../../api/invitation';  // ✅ Import API
import { PasswordStrength } from '../../common/Forms/PasswordStrength';
import { Spinner } from '../../common/UI/Spinner';

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);  // Loading state for fetching
    const [submitted, setSubmitted] = useState(false);
    const [invitationData, setInvitationData] = useState(null);
    const [errors, setErrors] = useState({});
    // Fetch invitation details on mount
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const fetchInvitationDetails = async () => {
            setIsFetching(true);
            try {
                const response = await invitationApi.getInvitationDetails(token); 
                setInvitationData({
                    email: response.data.email,
                    role: response.data.role,
                    organization: response.data.organization,
                    expires_at: response.data.expires_at
                });
            } catch (error) {
                // Invalid or expired token
                dispatch(showAlert({
                    type: 'error',
                    message: error.response?.data?.error || 'Invalid or expired invitation link'
                }));
                navigate('/login');
            } finally {
                setIsFetching(false);
            }
        };
        fetchInvitationDetails();
    }, [token, navigate, dispatch]);
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
            await dispatch(acceptInvitation({ 
                token, 
                ...formData 
            })).unwrap();
            setSubmitted(true);
            dispatch(showAlert({
                type: 'success',
                message: 'Account created successfully! Redirecting to login...'
            }));
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            dispatch(showAlert({
                type: 'error',
                message: err.message || 'Failed to accept invitation'
            }));
        } finally {
            setIsLoading(false);
        }
    };
    
    // ✅ Show loading while fetching invitation details
    if (isFetching) {
        return (
            <div className="auth-page">
                <div className="auth-header-text">
                    <h2>Loading Invitation...</h2>
                </div>
                <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                </div>
            </div>
        );
    }
    
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
            
            {/* ✅ Show REAL invitation data from API */}
            {invitationData && (
                <div className="invitation-details">
                    <div className="detail-item">
                        <FiMail className="detail-icon" />
                        <span>{invitationData.email}</span>
                    </div>
                    <div className="detail-item">
                        <FiUser className="detail-icon" />
                        <span>Role: {invitationData.role}</span>
                    </div>
                    <div className="detail-item">
                        <span className="organization">{invitationData.organization}</span>
                    </div>
                    {invitationData.expires_at && (
                        <div className="detail-item text-sm text-gray-500">
                            Expires: {new Date(invitationData.expires_at).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
            
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