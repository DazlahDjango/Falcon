import React from "react";

const UserStatusBadge = ({ isActive }) => {
    return (
        <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};
export default UserStatusBadge;