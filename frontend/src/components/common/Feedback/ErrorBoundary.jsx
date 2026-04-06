import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
        
        // Log error to monitoring service
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        
        // Send to error tracking (Sentry, etc.)
        if (window.Sentry) {
            window.Sentry.captureException(error, { extra: errorInfo });
        }
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };
    handleReload = () => {
        window.location.reload();
    };
    render() {
        const { hasError, error } = this.state;
        const { fallback, children } = this.props;
        
        if (hasError) {
            if (fallback) {
                return fallback;
            }
            
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <div className="error-icon">
                            <FiAlertTriangle size={48} />
                        </div>
                        <h2 className="error-title">Something went wrong</h2>
                        <p className="error-message">
                            {error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="error-actions">
                            <button className="btn btn-primary" onClick={this.handleReset}>
                                <FiRefreshCw size={16} />
                                Try Again
                            </button>
                            <button className="btn btn-secondary" onClick={this.handleReload}>
                                Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details</summary>
                                <pre>{error?.stack}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        return children;
    }
}
// HOC to wrap components with error boundary
export const withErrorBoundary = (Component, errorHandler = null) => {
    return (props) => (
        <ErrorBoundary onError={errorHandler}>
            <Component {...props} />
        </ErrorBoundary>
    );
};

export default ErrorBoundary;