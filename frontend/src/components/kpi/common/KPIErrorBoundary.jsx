import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class KPIErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("KPI ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/kpi/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="kpi-error-boundary-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    margin: '2rem auto',
                    maxWidth: '600px',
                    border: '1px solid #fee2e2'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#fef2f2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <FiAlertTriangle size={32} />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Something went wrong
                    </h2>

                    <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '450px', lineHeight: 1.5 }}>
                        An unexpected error occurred while loading this section. This might be due to a temporary network hiccup or session expiration.
                    </p>

                    {this.state.error?.message && (
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color: '#9ca3af',
                            fontFamily: 'monospace',
                            marginBottom: '1.5rem',
                            maxWidth: '100%',
                            overflowX: 'auto'
                        }}>
                            {this.state.error.message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                background: '#4f46e5',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <FiRefreshCw size={16} />
                            Reload Page
                        </button>

                        <button
                            onClick={this.handleGoHome}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <FiHome size={16} />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default KPIErrorBoundary;
