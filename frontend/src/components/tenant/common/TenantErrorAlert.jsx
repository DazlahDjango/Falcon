// frontend/src/components/tenant/common/TenantErrorAlert.jsx
import React from 'react';

export const TenantErrorAlert = ({ error, onRetry, onDismiss, title = "Error" }) => {
    if (!error) return null;

    const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

    return (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 mb-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">{title}</h3>
                    <div className="mt-1 text-sm text-red-700">
                        <p>{errorMessage}</p>
                    </div>
                    {(onRetry || onDismiss) && (
                        <div className="mt-3 flex gap-3">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="text-sm font-medium text-red-800 hover:text-red-900"
                                >
                                    Try again
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-sm font-medium text-red-800 hover:text-red-900"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};