// frontend/src/components/auth/RequirePermission.jsx

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequirePermission = ({ children, permissions = [], roles = [] }) => {
    const { user, token } = useSelector((state) => state.auth);

    // Not authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check roles if specified
    if (roles.length > 0) {
        const userRole = user?.role;
        const hasRole = roles.includes(userRole);
        if (!hasRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Check permissions if specified
    if (permissions.length > 0) {
        const userPermissions = user?.permissions || [];
        const hasPermission = permissions.some(p => userPermissions.includes(p));
        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default RequirePermission;