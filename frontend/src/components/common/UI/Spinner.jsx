import React from 'react';

const Spinner = ({ size = 'md', color = 'primary', className = '', ...props }) => {
    const sizes = {
        sm: 'spinner-sm',
        md: 'spinner-md',
        lg: 'spinner-lg',
        xl: 'spinner-xl'
    };
    const colors = {
        primary: 'spinner-primary',
        secondary: 'spinner-secondary',
        white: 'spinner-white',
        gray: 'spinner-gray'
    };
    const spinnerClasses = [
        'spinner',
        sizes[size],
        colors[color],
        className
    ].filter(Boolean).join(' ');
    return (
        <div className={spinnerClasses} {...props}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                    className="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    className="spinner-path"
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default Spinner;