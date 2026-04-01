import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { verifyEmail, resendVerification } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';
import { Spinner } from '../../common/UI/Spinner';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    useEffect(() => {
        if (token) {
            verifyEmailToken();
        } else if (email) {
            setStatus('ready');
        } else {
            navigate('/login');
        }
    }, [token, email, navigate]);
    const verifyEmailToken = async () => {
        try {
            await dispatch(verifyEmail(token)).unwrap();
            setStatus('success');
            setMessage('Your email has been verified successfully!');
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Invalid or expired verification link');
        }
    };
    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        try {
            await dispatch(resendVerification(email)).unwrap();
            setStatus('recent');
            setMessage('Verification email sent! Please check your inbox.');
            dispatch(showAlert({ type: 'success', message: 'Verification email sent' }));
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Failed to send verification email');
        } finally {
            setResending(false);
        }
    };
    if (status=== 'verifying') {
        return (
            <div className="auth-page">
                <div className="auth-header-text">
                    <h2>Verifying your email</h2>
                    <p>Please wait while we verify your email</p>
                </div>
                <div className="auth-loading">
                    <Spinner size='lg' />
                </div>
            </div>
        );
    }
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Email Verification</h2>
            </div>
            
            <div className={`auth-status ${status}`}>
                {status === 'success' && (
                    <>
                        <FiCheckCircle size={64} className="status-icon success" />
                        <h3>Email Verified!</h3>
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary">
                            Go to Login
                        </Link>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <FiAlertCircle size={64} className="status-icon error" />
                        <h3>Verification Failed</h3>
                        <p>{message}</p>
                        {email && (
                            <button 
                                className="btn btn-primary" 
                                onClick={handleResend}
                                disabled={resending}
                            >
                                {resending ? <Spinner size="sm" /> : (
                                    <>
                                        <FiRefreshCw size={16} />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        )}
                        <Link to="/login" className="btn btn-secondary">
                            Back to Login
                        </Link>
                    </>
                )}
                
                {status === 'ready' && (
                    <>
                        <div className="ready-icon">📧</div>
                        <h3>Verify Your Email</h3>
                        <p>
                            We've sent a verification email to <strong>{email}</strong>. 
                            Please check your inbox and click the verification link to activate your account.
                        </p>
                        <p className="small-text">
                            Didn't receive the email? Check your spam folder or click below to resend.
                        </p>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleResend}
                            disabled={resending}
                        >
                            {resending ? <Spinner size="sm" /> : (
                                <>
                                    <FiRefreshCw size={16} />
                                    Resend Verification Email
                                </>
                            )}
                        </button>
                    </>
                )}
                
                {status === 'resent' && (
                    <>
                        <FiMail size={64} className="status-icon success" />
                        <h3>Email Sent!</h3>
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary">
                            Go to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};
export { verifyEmail };