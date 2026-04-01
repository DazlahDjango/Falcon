import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { LoginForm } from './components/LoginForm';
import { login, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';
import { Spinner } from '../../common/UI/Spinner';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, error, requiresMfa, mfaToken } = useSelector((state) => state.auth);
    const { showPassword, setShowPassword } = useState(false);
    const { isAuthenticated } = useSelector((state) => state.auth);
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);
    useEffect(() => {
        return () => {
            if (error) dispatch(clearError());
        };
    }, [dispatch, error]);
    useEffect(() => {
        if (requiresMfa && mfaToken) {
            navigate('/mfa-verify', { state: {mfaToken, from: location.state?.from} });
        }
    }, [requiresMfa, mfaToken, navigate, location]);
    const handleSubmit = async (values) => {
        try {
            await dispatch(login(values)).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Login successfully' }));
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Login failed' }));
        }
    };
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Welcom back</h2>
                <p>Sign in to your account to continue</p>
            </div>
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
            <div className="auth-footer-links">
                <Link to="/forget-password" className="auth-link">Forget password?</Link>
                <span className="divider">|</span>
                <Link to="/register" className="auth-link">Creat an account</Link>
            </div>
            {process.env.REACT_APP_DEMO_MODE === 'true' && (
                <div className="demo-credentials">
                    <p>Demo Credentials:</p>
                    <code>user@example.com / User123!</code>
                </div>
            )}
        </div>
    );
};
export { Login };