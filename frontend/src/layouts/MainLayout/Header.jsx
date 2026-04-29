import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/accounts/useAuth';
import styles from './Header.module.css';

const Header = ({ onMenuClick, onSidebarToggle, sidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button 
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="Menu"
                >
                    ☰
                </button>
                <button 
                    className={styles.sidebarToggle}
                    onClick={onSidebarToggle}
                    aria-label="Toggle Sidebar"
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>
                <div className={styles.pageTitle}>
                    KPI Management System
                </div>
            </div>

            <div className={styles.headerRight}>
                <div className={styles.greeting}>
                    {getGreeting()}, {user?.name || user?.email}
                </div>
                <div className={styles.userMenu}>
                    <button 
                        className={styles.userAvatar}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User Menu"
                    >
                        {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </button>
                    {showUserMenu && (
                        <div className={styles.userDropdown}>
                            <div className={styles.userInfo}>
                                <div className={styles.userName}>{user?.name || user?.email}</div>
                                <div className={styles.userEmail}>{user?.email}</div>
                            </div>
                            <div className={styles.dropdownDivider} />
                            <button 
                                className={styles.dropdownItem}
                                onClick={() => navigate('/profile')}
                            >
                                Profile Settings
                            </button>
                            <button 
                                className={styles.dropdownItem}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;