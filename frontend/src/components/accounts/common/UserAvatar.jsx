import React from 'react';
import { FiUser } from 'react-icons/fi';

export const UserAvatar = ({ user, avatar, size = 'md', onClick, className = '', showStatus = false }) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  };

  const fontSizeMap = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    '2xl': 36,
  };

  const sizePx = sizeMap[size] || 40;
  const fontSize = fontSizeMap[size] || 16;

  const getInitials = () => {
    if (!user) return '?';
    if (user.full_name) {
      const parts = user.full_name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  const getColor = (email) => {
    if (!email) return '#64748b';
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#ef4444',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#6366f1',
      '#14b8a6',
      '#8b5cf6',
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials();
  const color = user?.email ? getColor(user.email) : '#64748b';
  const avatarUrl = avatar || user?.avatar || user?.profile?.avatar;

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`user-avatar size-${size} ${onClick ? 'clickable' : ''} ${className}`}
      style={{ width: sizePx, height: sizePx, backgroundColor: color }}
      onClick={handleClick}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.full_name || user?.email || 'User'}
          className="user-avatar-img"
        />
      ) : (
        <span className="user-avatar-initials" style={{ fontSize: fontSize }}>
          {initials}
        </span>
      )}
      {showStatus && user?.is_active !== false && (
        <span className="user-avatar-status online" />
      )}
      {showStatus && user?.is_active === false && (
        <span className="user-avatar-status offline" />
      )}
    </div>
  );
};
export default UserAvatar;