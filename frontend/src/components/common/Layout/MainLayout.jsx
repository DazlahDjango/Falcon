import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { logout } from '../../../store/slices/authSlice';
import { showAlert } from '../../../store/slices/uiSlice';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
            setSidebarCollapsed(true);
        } else {
            setSidebarOpen(true);
            setSidebarCollapsed(false);
        }
    }, [isMobile]);
    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarCollapsed);
        }
    };
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);
    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Logged out successfuly'}));
            navigate('/login');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed'}));
        }
    };
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }
    return (
        <div className="main-layout">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                user={user}
                currentPath={location.pathname}
            />
            {/* Main Content Area */}
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
export { MainLayout };