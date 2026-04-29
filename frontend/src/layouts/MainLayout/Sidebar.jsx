import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/accounts/useAuth';
import { NAVIGATION_ITEMS } from '../../routes/types';
import styles from './Sidebar.module.css';

/**
 * Sidebar - Main navigation sidebar
 */
const Sidebar = ({ collapsed, isMobileOpen, onCloseMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
        return item.roles.some(role => user?.roles?.includes(role));
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarClasses = `${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`;

    return (
        <>
            {isMobileOpen && (
                <div className={styles.overlay} onClick={onCloseMobile} />
            )}
            <aside className={sidebarClasses}>
                <div className={styles.logo}>
                    <h2>{collapsed ? 'KPI' : 'KPI System'}</h2>
                </div>

                <nav className={styles.nav}>
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => 
                                `${styles.navLink} ${isActive ? styles.active : ''}`
                            }
                            onClick={onCloseMobile}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.footer}>
                    {!collapsed && (
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user?.name || user?.email}</div>
                            <div className={styles.userRole}>{user?.roles?.[0] || 'User'}</div>
                        </div>
                    )}
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        {collapsed ? '🚪' : 'Logout'}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;