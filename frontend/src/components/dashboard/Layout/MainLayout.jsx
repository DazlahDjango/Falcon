import React, { useEffect, useState, Suspense } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from '../../../hooks/accounts/useMediaQuery';
import { logout } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { useAuth } from '../../../hooks/accounts/useAuth';
import LoadingScreen from '../../../components/common/Feedback/LoadingScreen';
import { DASHBOARD_TYPES } from '../../../config/constants/dashboardConstants';

const ExecutiveSidebar = React.lazy(() => import('../Dashboard/Sidebars/ExecutiveSidebar'));
const ClientAdminSidebar = React.lazy(() => import('../Dashboard/Sidebars/ClientAdminSidebar'));
const SuperAdminSidebar = React.lazy(() => import('../Dashboard/Sidebars/SuperAdminSidebar'));
const Header = React.lazy(() => import('./Header'));
const Footer = React.lazy(() => import('./Footer'));

const getSidebarComponent = (role) => {
    switch (role) {
        case 'executive':
            return ExecutiveSidebar;
        case 'client_admin':
            return ClientAdminSidebar;
        case 'super_admin':
            return SuperAdminSidebar;
        default:
            return ExecutiveSidebar;
    }
};

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { isAuthenticated, isLoading, user } = useAuth();
    const currentTenant = useSelector((state) => state.tenant?.currentTenant);

    const SidebarComponent = user?.role ? getSidebarComponent(user.role) : ExecutiveSidebar;

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
            setSidebarCollapsed(true);
        } else {
            setSidebarOpen(true);
            setSidebarCollapsed(false);
        }
    }, [isMobile]);
    
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);
    
    if (isLoading) {
        return <LoadingScreen fullScreen message="Checking authentication..." />;
    }
    
    if (!isAuthenticated) {
        return null;
    }
    
    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarCollapsed);
        }
    };
    
    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Logged out successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed' }));
        }
    };
    
    return (
        <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Suspense fallback={<div className="sidebar-loading" />}>
                <SidebarComponent
                    isOpen={sidebarOpen}
                    isCollapsed={sidebarCollapsed}
                    onToggle={toggleSidebar}
                    user={user}
                    currentTenant={currentTenant}
                    currentPath={location.pathname}
                />
            </Suspense>
            <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
                <Suspense fallback={<div className="header-loading" />}>
                    <Header
                        user={user}
                        onToggleSidebar={toggleSidebar}
                        onLogout={handleLogout}
                        sidebarOpen={sidebarOpen}
                        sidebarCollapsed={sidebarCollapsed}
                    />
                </Suspense>
                <main className="content-wrapper">
                    <Suspense fallback={<LoadingScreen message="Loading..." />}>
                        <Outlet />
                    </Suspense>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;