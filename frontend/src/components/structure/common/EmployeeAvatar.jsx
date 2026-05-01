import React from 'react';

const EmployeeAvatar = ({ user, firstName, lastName, size = 'md', className = '' }) => {
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  const sizeClass = {
    sm: 'employee-avatar-sm',
    md: '',
    lg: 'employee-avatar-lg',
  }[size];
  return (
    <div className={`employee-avatar ${sizeClass} ${className}`}>
      {getInitials()}
    </div>
  );
};
export default EmployeeAvatar;