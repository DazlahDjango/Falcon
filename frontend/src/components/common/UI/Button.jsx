import React, { Children } from "react";

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon = null,
    iconPosition = 'left',
    onClick,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        warning: 'btn-warning',
        success: 'btn-success',
        info: 'btn-info',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        link: 'btn-link'
    };
    
    // Size classes
    const sizes = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg'
    };
    const baseClass = 'btn';
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;
    const widthClass = fullWidth ? 'btn-full-width' : '';
    const disabledClass  = disabled || loading ? 'btn-disabled' : '';
    const buttonClasses = [
        baseClass,
        variantClass,
        sizeClass,
        widthClass,
        disabledClass,
        className
    ].filter(Boolean).join(' ');
    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <span className="btn-spinner">
                    <svg className="spinner" viewBox="0 0 24 24">
                        <circle className="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </span>
            )}
            
            {icon && iconPosition === 'left' && !loading && (
                <span className="btn-icon-left">{icon}</span>
            )}
            
            <span className="btn-text">{children}</span>
            
            {icon && iconPosition === 'right' && (
                <span className="btn-icon-right">{icon}</span>
            )}
        </button>
    );
};
export default Button;