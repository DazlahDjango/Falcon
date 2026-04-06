import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import LoginForm from './components/LoginForm';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, isLoading } = useAuthContext();
    const [error, setError] = useState(null);
    const { login } = useAuthContext();
    
    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    
    const handleSubmit = async (values) => {
        try {
            setError(null);
            const result = await login(values);
            
            if (result.success) {
                dispatch(showAlert({ type: 'success', message: 'Login successful!' }));
                // AuthContext.login() already handles redirect via state update
            } else {
                const errorMessage = result.error || 'Login failed';
                setError(errorMessage);
                dispatch(showAlert({ type: 'error', message: errorMessage }));
            }
        } catch (err) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            dispatch(showAlert({ type: 'error', message: errorMessage }));
        }
    };
    
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Welcome back</h2>
                <p>Sign in to your account to continue</p>
            </div>
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
            <div className="auth-footer-links">
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                <span className="divider">|</span>
                <Link to="/register" className="auth-link">Create an account</Link>
            </div>
        </div>
    );
};

export default Login;