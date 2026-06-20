import React from 'react';
import { errorHandler } from '../utils/error/errorHandler';

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
        // Ignore DOM manipulation errors caused by browser extensions
        // (Grammarly, Google Translate, LastPass, etc. inject DOM nodes
        //  that React then tries to remove, causing removeChild errors)
        const msg = error?.message || '';
        const isDomExtensionError = (
            msg.includes('removeChild') ||
            msg.includes('insertBefore') ||
            msg.includes('is not a child of this node') ||
            msg.includes('Node to be removed is not a child')
        );
        if (isDomExtensionError) {
            // Don't show error screen — just reset silently
            return { hasError: false, error: null, errorInfo: null };
        }
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        const msg = error?.message || '';
        const isDomExtensionError = (
            msg.includes('removeChild') ||
            msg.includes('insertBefore') ||
            msg.includes('is not a child of this node')
        );
        if (isDomExtensionError) return; // Silently ignore browser extension DOM errors

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
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <h2>Something went wrong</h2>
                        <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
                        {this.props.showDetails && this.state.errorInfo && (
                            <details>
                                <summary>Error Details</summary>
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                        <button onClick={this.handleReset}>
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