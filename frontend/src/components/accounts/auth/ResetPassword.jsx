import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { resetPassword } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import PasswordStrength from '../../common/Forms/PasswordStrength';
import Spinner from '../../common/UI/Spinner';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassowrd, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (!token) {
            dispatch(showAlert({ type: 'error', message: 'Invalid or missing reset token' }));
            navigate('/forgot-password');
        }
    }, [token, navigate, dispatch]);
    const validateForm = () => {
        const newErrors = {};
        
        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await dispatch(resetPassword({ token, password, confirm_password: confirmPassword })).unwrap();
            setSubmitted(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Failed to reset password' }));
        } finally {
            setIsLoading(false);
        }
    };
    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-header-text">
                    <h2>Password reset successfully</h2>
                    <p>Your password has been changed successfully</p>
                </div>
                <div className="auth-success-message">
                    <FiCheckCircle size={48} className="success-icon" />
                    <p>You can now login with your new password</p>
                </div>
                <div className="auth-footer-links">
                    <Link to="/login" className="auth-link">Go to login</Link>
                </div>
            </div>
        );
    }
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Create New Password</h2>
                <p>Enter a new password for your account</p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    {errors.password && <div className="input-feedback error">{errors.password}</div>}
                </div> 
                <PasswordStrength password={password} />
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            required
                        />
                    </div>
                    {errors.confirmPassword && <div className="input-feedback error">{errors.confirmPassword}</div>}
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};
export default ResetPassword;