import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RegisterForm } from './components/RegisterForm';
import { register, clearError } from '../../store/slices/authSlice';
import { showAlert } from '../../store/slices/uiSlice';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        return () => {
            if (error) dispatch(clearError());
        };
    }, [dispatch, error]);
    const handleSubmit = async (values) => {
        try {
            await dispatch(register(values)).unwrap();
            dispatch(showAlert({
                type: 'success', 
                message: 'Registration successful! Please check your email to verify your account.'
            }));
            navigate('/login', {state: { registered: true }});
        } catch (err) {
            dispatch(showAlert({ type: 'error', message: err.message || 'Registration  failed' }));
        }
    };
    return (
        <div className="auth-page">
            <div className="auth-header-text">
                <h2>Create account</h2>
                <p>Join Falcon PMS to manage your performance</p>
            </div>
            <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
            <div className="auth-footer-link">
                <span>Already have an account?</span>
                <Link to="/login" className="auth-link">Sign in</Link>
            </div>
        </div>
    );
};
export { Register }