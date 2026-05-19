import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Footer from './Footer';
import { useMediaQuery } from '../../../hooks/accounts/useMediaQuery';
import { logout } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { useAuth } from '../../../hooks/accounts/useAuth';
import LoadingScreen from '../Feedback/LoadingScreen';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const location = useLocation();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { isAuthenticated, isLoading, user } = useAuth();

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
            navigate('/login');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed' }));
        }
    };
    
    return (
        <div className="main-layout">
            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                user={user}
                currentPath={location.pathname}
            />
            <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Header
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                    sidebarOpen={sidebarOpen}
                    sidebarCollapsed={sidebarCollapsed}
                />
                <main className="content-wrapper">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;