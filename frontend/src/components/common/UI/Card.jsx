import React from 'react';

const Card = ({
    children,
    title,
    subtitle,
    icon = null,
    actions = null,
    footer = null,
    loading = false,
    variant = 'default',
    className = '',
    bodyClassName = '',
    headerClassName = '',
    footerClassName = '',
    ...props
}) => {
    const variants = {
        default: 'card-default',
        primary: 'card-primary',
        success: 'card-success',
        warning: 'card-warning',
        danger: 'card-danger',
        info: 'card-info',
        outline: 'card-outline'
    };
    const cardClasses = [
        'card',
        variants[variant],
        className
    ].filter(Boolean).join(' ');
    return (
        <div className={cardClasses} {...props}>
            {(title || subtitle || icon || actions) && (
                <div className={`card-header ${headerClassName}`}>
                    <div className="card-header-left">
                        {icon && <div className="card-icon">{icon}</div>}
                        <div>
                            {title && <h3 className="card-title">{title}</h3>}
                            {subtitle && <p className="card-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className={`card-body ${bodyClassName}`}>
                {loading ? (
                    <div className="card-loading">
                        <div className="spinner"></div>
                        <span>Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </div>
            {footer && (
                <div className={`card-footer ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};
export default Card;