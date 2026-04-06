import React from 'react';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = false,
    icon = null,
    className = '',
    ...props
}) => {
    const variants = {
        default: 'badge-default',
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        dark: 'badge-dark',
        light: 'badge-light'
    };
    const sizes = {
        sm: 'badge-sm',
        md: 'badge-md',
        lg: 'badge-lg'
    };
    const badgeClasses = [
        'badge',
        variants[variant],
        sizes[size],
        rounded ? 'badge-rounded' : '',
        className
    ].filter(Boolean).join(' ');
    return (
        <span className={badgeClasses} {...props}>
            {icon && <span className="badge-icon">{icon}</span>}
            <span className="badge-text">{children}</span>
        </span>
    );
};
export default Badge;