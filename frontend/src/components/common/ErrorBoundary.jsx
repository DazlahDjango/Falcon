import React from 'react';
import { errorHandler } from '../../utils/error';
import styles from './ErrorBoundary.module.css';

/**
 * ErrorBoundary - Catches and handles React component errors
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        errorHandler.handleError(error, {
            component: this.props.componentName || 'Unknown',
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    reset: this.handleReset,
                });
            }

            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.content}>
                        <div className={styles.icon}>⚠️</div>
                        <h2>Something went wrong</h2>
                        <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
                        {this.props.showDetails && this.state.errorInfo && (
                            <details className={styles.details}>
                                <summary>Error Details</summary>
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                        <button onClick={this.handleReset} className={styles.button}>
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;