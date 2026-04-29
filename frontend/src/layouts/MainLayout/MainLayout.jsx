import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/accounts/useAuth';
import styles from './MainLayout.module.css';

/**
 * MainLayout - Main application layout with sidebar and header
 */
const MainLayout = () => {
    const { user } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Load sidebar state from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebar_collapsed');
        if (savedState !== null) {
            setSidebarCollapsed(savedState === 'true');
        }
    }, []);

    // Save sidebar state to localStorage
    const handleSidebarToggle = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState);
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [window.location.pathname]);

    return (
        <div className={`${styles.layout} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            <Sidebar 
                collapsed={sidebarCollapsed} 
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
            <div className={styles.main}>
                <Header 
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onSidebarToggle={handleSidebarToggle}
                    sidebarCollapsed={sidebarCollapsed}
                />
                <main className={styles.content}>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;