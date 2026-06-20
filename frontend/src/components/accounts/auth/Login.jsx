import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from './components/LoginForm';
import { login, clearError } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { ROUTES } from '../../../config/constants';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error, isAuthenticated, requiresMfa } = useSelector((state) => state.auth);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (requiresMfa) {
            navigate('/mfa-verify', { state: { mfaToken: localStorage.getItem('mfa_token') } });
        }
    }, [requiresMfa, navigate]);

    useEffect(() => {
        return () => {
            if (error) dispatch(clearError());
        };
    }, [dispatch, error]);

    const handleSubmit = async (values) => {
        setLocalError(null);
        try {
            const result = await dispatch(login(values)).unwrap();
            
            if (result.requires_mfa) {
                dispatch(showAlert({ type: 'info', message: 'Please complete MFA verification' }));
                navigate('/mfa-verify', { state: { mfaToken: result.mfa_token } });
            } else {
                dispatch(showAlert({ type: 'success', message: 'Login successful!' }));
                navigate(ROUTES.DASHBOARD);
            }
        } catch (err) {
            const errorMessage = err || 'Invalid email or password';
            setLocalError(errorMessage);
            dispatch(showAlert({ type: 'error', message: errorMessage }));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Welcome back</h2>
                <p>Sign in to your account to continue</p>
            </div>
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={localError || error} />
            <div className="auth-footer-links">
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                <span className="divider">|</span>
                <Link to="/register" className="auth-link">Create an account</Link>
            </div>
        </div>
    );
};

export default Login;