import React from 'react';

const Avatar = ({
    src,
    name,
    size = 'md',
    shape = 'circle',
    status = null,
    className = '',
    ...props
}) => {
    const sizes = {
        xs: 'avatar-xs',
        sm: 'avatar-sm',
        md: 'avatar-md',
        lg: 'avatar-lg',
        xl: 'avatar-xl',
        '2xl': 'avatar-2xl'
    };
    const shapes = {
        circle: 'avatar-circle',
        square: 'avatar-square',
        rounded: 'avatar-rounded'
    };
    const statusColors = {
        online: 'status-online',
        offline: 'status-offline',
        away: 'status-away',
        busy: 'status-busy'
    };
    const getInitials = () => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };
    const avatarClasses = [
        'avatar',
        sizes[size],
        shapes[shape],
        className
    ].filter(Boolean).join(' ');
    return (
        <div className="avatar-container">
            <div className={avatarClasses} {...props}>
                {src ? (
                    <img src={src} alt={name || 'Avatar'} className="avatar-image" />
                ) : (
                    <div className="avatar-fallback">
                        {getInitials()}
                    </div>
                )}
            </div>
            {status && (
                <span className={`avatar-status ${statusColors[status]}`} />
            )}
        </div>
    );
};

export default Avatar;