import React, {useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MFAForm } from './components/MFAForm';
import { verifyMfa, clearMfaState } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';

const MFAVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, mfaToken, isAuthenticated } = useSelector((state) => state.auth);
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    useEffect(() => {
        const token = location.state?.mfaToken || mfaToken;
        if (!token) {
            navigate('/login');
        }
    }, [location.state, mfaToken, navigate]);
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
    const handleVerify = async (values) => {
        try {
            await dispatch(verifyMfa({
                mfa_token: location.state?.mfaToken || mfaToken,
                otp: values.otp
            })).unwrap();
            dispatch(showAlert({ type: 'success', message: 'MFA verification successful!' }));
            navigate('/dashboard');
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Invalid verification code' }));
        }
    };
    const handleResend = () => {
        setTimeLeft(30);
        setCanResend(false);
        dispatch(showAlert({ type: 'info', message: 'New verification code send' }));
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
                    onClick={() => navigate('/recovery-codes')}
                >
                    Use recovery code
                </button>
            </div>
        </div>
    );
};
export { MFAVerify };