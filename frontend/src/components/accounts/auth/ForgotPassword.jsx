import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { forgotPassword } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            dispatch(showAlert({ type: 'error', message: 'Please enter your email address' }));
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(forgotPassword(email)).unwrap();
            setSubmitted(true);
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Failed to send reset email' }));
        } finally {
            setIsLoading(false)
        }
    };
    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-header-text">
                    <h2>Check your email</h2>
                    <p>We've sent a password reset link to <strong>{email}</strong></p>
                </div>
                <div className="auth-success-message">
                    <div className="success-icon">📧</div>
                    <p>Click the link in the email to reset your password. The link will expire in 24 hours.</p>
                    <p className="small-text">Didn't receive the email? Check your spam folder or try again.</p>
                </div>
                <div className="auth-footer-links">
                    <Link to="/login" className="auth-link">
                        <FiArrowLeft size={14} />
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Reset Password</h2>
                <p>Enter your email to receive a password reset link</p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="form-input"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : 'Send Reset Link'}
                </button>
            </form>
            <div className="auth-footer-links">
                <Link to="/login" className="auth-link">
                    <FiArrowLeft size={14} />
                    Back to login
                </Link>
            </div>
        </div>
    );
};
export default ForgotPassword;