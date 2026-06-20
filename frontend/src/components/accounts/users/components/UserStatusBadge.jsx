import React from 'react';

const UserStatusBadge = ({ isActive }) => {
    return (
        <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
            <span className={`status-dot ${isActive ? 'dot-active' : 'dot-inactive'}`}></span>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export default UserStatusBadge;