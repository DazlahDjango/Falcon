import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MFAForm from './components/MFAForm';
import { verifyMfa, clearMfaState } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const MFAVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [mfaToken, setMfaToken] = useState(null);

    useEffect(() => {
        const token = location.state?.mfaToken || localStorage.getItem('mfa_token');
        if (!token) {
            navigate('/login');
        } else {
            setMfaToken(token);
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        return () => {
            dispatch(clearMfaState());
        };
    }, [dispatch]);

    const handleVerify = async (values) => {
        if (!mfaToken) {
            dispatch(showAlert({ type: 'error', message: 'MFA token missing. Please login again.' }));
            navigate('/login');
            return;
        }
        
        try {
            await dispatch(verifyMfa({
                mfa_token: mfaToken,
                otp: values.otp
            })).unwrap();
            localStorage.removeItem('mfa_token');
            dispatch(showAlert({ type: 'success', message: 'MFA verification successful!' }));
            navigate('/dashboard');
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err || 'Invalid verification code' }));
        }
    };

    const handleResend = () => {
        setTimeLeft(30);
        setCanResend(false);
        // In a real implementation, this would trigger a new OTP via email/sms
        dispatch(showAlert({ type: 'info', message: 'New verification code sent to your authenticator app' }));
    };

    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Two-Factor Authentication</h2>
                <p>Enter the verification code from your authenticator app</p>
            </div>
            
            <MFAForm 
                onSubmit={handleVerify} 
                isLoading={isLoading}
                timeLeft={timeLeft}
                canResend={canResend}
                onResend={handleResend}
            />
            
            <div className="auth-footer-links">
                <button 
                    className="auth-link-button" 
                    onClick={() => navigate('/login')}
                >
                    Back to login
                </button>
                <span className="divider">|</span>
                <button 
                    className="auth-link-button" 
                    onClick={() => navigate('/security/mfa/backup-codes')}
                >
                    Use recovery code
                </button>
            </div>
        </div>
    );
};

export default MFAVerify;