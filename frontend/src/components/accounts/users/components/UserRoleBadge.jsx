import React from "react";

const UserRoleBadge = ({ role }) => {
    const getRoleClass = () => {
        switch (role) {
            case 'super_admin': return 'role-super-admin';
            case 'client_admin': return 'role-client-admin';
            case 'executive': return 'role-executive';
            case 'supervisor': return 'role-supervisor';
            case 'dashboard-champion': return 'role-dashboard-champion';
            case 'staff': return 'role-staff';
            case 'read_only': return 'role-read-only';
            default: return 'role-staff';
        }
    };
    const getRoleDisplay = () => {
        switch (role) {
            case 'super_admin': return 'Super Admin';
            case 'client_admin': return 'Admin';
            case 'executive': return 'Executive';
            case 'supervisor': return 'Supervisor';
            case 'dashboard_champion': return 'Dashboard Champion';
            case 'staff': return 'Staff';
            case 'read_only': return 'Read Only';
            default: return role;
        }
    };
    return (
        <span className={`role-badge ${getRoleClass()}`}>
            {getRoleDisplay()}
        </span>
    );
};
export default UserRoleBadge;