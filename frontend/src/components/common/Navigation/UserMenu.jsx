import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
    FiUser, FiSettings, FiShield, FiBell, FiHelpCircle, FiLogOut, FiChevronDown, FiActivity, FiLock
} from "react-icons/fi";
import { logout } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const UserMenu = () => {
    const [isOpen, setIsOpen] = useEffect(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { isConnected } = useSelector((state) => state.websocket);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'Logged out successfully' }));
            navigate('/login');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed' }));
        }
        setIsOpen(false);
    };
    const menuItems = [
        { 
            icon: FiUser, 
            label: 'My Profile', 
            path: '/profile',
            description: 'View and edit your profile'
        },
        { 
            icon: FiSettings, 
            label: 'Settings', 
            path: '/settings',
            description: 'Account and app settings'
        },
        { 
            icon: FiShield, 
            label: 'Security', 
            path: '/security',
            description: 'MFA, sessions, and security'
        },
        { 
            icon: FiBell, 
            label: 'Notifications', 
            path: '/notifications',
            description: 'Manage notifications'
        },
        { 
            icon: FiHelpCircle, 
            label: 'Help & Support', 
            path: '/help',
            description: 'Documentation and support'
        }
    ];
    const wsStatus = isConnected ? 'Connected' : 'Disconnected';
    const wsStatusClass = isConnected ? 'connected' : 'disconnected';
    return (
        <div className="user-menu" ref={menuRef}>
            <button 
                className="user-menu-trigger" 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="User menu"
            >
                <div className="user-avatar">
                    <img 
                        src={user?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                        alt={user?.username}
                    />
                </div>
                <div className="user-info">
                    <span className="user-name">{user?.first_name || user?.username}</span>
                    <span className="user-role">{user?.role_display}</span>
                </div>
                <FiChevronDown className={`menu-arrow ${isOpen ? 'rotate' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="user-menu-dropdown">
                    {/* User Header */}
                    <div className="dropdown-header">
                        <div className="user-avatar-large">
                            <img 
                                src={user?.avatar_url || '/static/accounts/img/default-avatar.png'} 
                                alt={user?.username}
                            />
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.first_name} {user?.last_name}</div>
                            <div className="user-email">{user?.email}</div>
                            <div className="user-role-badge">{user?.role_display}</div>
                        </div>
                    </div>
                    
                    {/* WebSocket Status */}
                    <div className="dropdown-ws-status">
                        <FiActivity size={14} />
                        <span>Real-time Connection</span>
                        <span className={`status-badge ${wsStatusClass}`}>{wsStatus}</span>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    {/* Menu Items */}
                    <div className="dropdown-menu-items">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                className="menu-item"
                                onClick={() => {
                                    navigate(item.path);
                                    setIsOpen(false);
                                }}
                            >
                                <item.icon size={18} />
                                <div className="menu-item-content">
                                    <span className="menu-item-label">{item.label}</span>
                                    <span className="menu-item-description">{item.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    {/* Logout Button */}
                    <button className="logout-item" onClick={handleLogout}>
                        <FiLogOut size={18} />
                        <div className="menu-item-content">
                            <span className="menu-item-label">Logout</span>
                            <span className="menu-item-description">Sign out of your account</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
export default UserMenu;