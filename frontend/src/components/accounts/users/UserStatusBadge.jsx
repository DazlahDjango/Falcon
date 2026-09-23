import React from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShield,
  FiLock,
  FiAlertCircle,
} from 'react-icons/fi';

/**
 * Single Status Badge for a specific status type (active, verified, locked)
 */
export const UserStatusBadge = ({
  user,
  isActive,
  isVerified,
  isLocked,
  variant = 'composite', // 'composite' | 'active' | 'verified' | 'locked'
  size = 'sm',
}) => {
  // Normalize boolean values from either props or user object
  const active = user ? user.is_active !== false : isActive !== false;
  const verified = user ? user.is_verified === true : isVerified === true;
  const locked = user
    ? Boolean(user.locked_until && new Date(user.locked_until) > new Date())
    : Boolean(isLocked);

  if (variant === 'active') {
    return (
      <span className={`user-status-badge ${active ? 'active' : 'inactive'} ${size}`}>
        {active ? <FiCheckCircle className="status-icon" /> : <FiXCircle className="status-icon" />}
        {active ? 'Active' : 'Inactive'}
      </span>
    );
  }

  if (variant === 'verified') {
    return (
      <span className={`user-status-badge ${verified ? 'verified' : 'unverified'} ${size}`}>
        {verified ? <FiShield className="status-icon" /> : <FiAlertCircle className="status-icon" />}
        {verified ? 'Verified' : 'Unverified'}
      </span>
    );
  }

  if (variant === 'locked') {
    if (!locked) return null;
    return (
      <span className={`user-status-badge locked ${size}`}>
        <FiLock className="status-icon" />
        Locked
      </span>
    );
  }

  // Composite / Multi-Status Display
  return (
    <div className="user-status-group">
      <span className={`user-status-badge ${active ? 'active' : 'inactive'} ${size}`}>
        {active ? <FiCheckCircle className="status-icon" /> : <FiXCircle className="status-icon" />}
        {active ? 'Active' : 'Inactive'}
      </span>

      <span className={`user-status-badge ${verified ? 'verified' : 'unverified'} ${size}`}>
        {verified ? <FiShield className="status-icon" /> : <FiAlertCircle className="status-icon" />}
        {verified ? 'Verified' : 'Unverified'}
      </span>

      {locked && (
        <span className={`user-status-badge locked ${size}`}>
          <FiLock className="status-icon" />
          Locked
        </span>
      )}
    </div>
  );
};

/**
 * UserStatusGroup renders all active, verification, and lock status tags
 */
export const UserStatusGroup = ({ user, size = 'sm' }) => {
  return <UserStatusBadge user={user} variant="composite" size={size} />;
};

export default UserStatusBadge;