import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMenu, FiX, FiChevronDown, FiHome, FiBarChart2, FiUsers, FiFile, FiSettings } from 'react-icons/fi';

const Navbar = ({ user, onMenuClick }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const location = useLocation();
    const { tenant } = useSelector((state) => state.tenant);
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.nav-dropdown')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    const navigationItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: FiHome,
            roles: ['all']
        },
        {
            name: 'Performance',
            path: null,
            icon: FiBarChart2,
            roles: ['all'],
            dropdown: [
                { name: 'KPIs', path: null, roles: ['all'] },
                { name: 'Reviews', path: null, roles: ['all'] },
                { name: 'Mission Reports', path: null, roles: ['all'] }
            ]
        },
        {
            name: 'Team',
            path: null,
            icon: FiUsers,
            roles: ['super_admin', 'client_admin', 'executive', 'supervisor'],
            dropdown: [
                { name: 'My Team', path: '/team', roles: ['super_admin', 'client_admin', 'executive', 'supervisor'] },
                { name: 'Reporting Chain', path: '/reporting-chain', roles: ['super_admin', 'client_admin', 'executive', 'supervisor'] },
                { name: 'Invitations', path: '/invitations', roles: ['super_admin', 'client_admin']}
            ]
        },
        {
            name: 'Reports',
            path: '/reports',
            icon: FiFile,
            roles: ['super_admin', 'client_admin', 'executive']
        },
        {
            name: 'Settings',
            path: null,
            icon: FiSettings,
            roles: ['all'],
            dropdown: [
                { name: 'Profile', path: '/profile', roles: ['all'] },
                { name: 'Security', path: '/security', roles: ['all'] },
                { name: 'Notifications', path: '/notifications', roles: ['all'] },
                { name: 'Tenant Settings', path: '/settings/tenant', roles: ['super_admin', 'client_admin'] }
            ]
        }
    ];
    const hasAccess = (roles) => {
        if (roles.includes('all')) return true;
        if (user?.role && roles.includes(user.role)) return true;
        return false;
    };
    const filteredItems = navigationItems.filter(item => hasAccess(item.roles));
    const toggleDropdown = (name, e) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === name ? null : name);
    };
    const renderDropdown = (item) => {
        if (!item.dropdown) return null;
        const filteredDropdown = item.dropdown.filter(drop => hasAccess(drop.roles));
        if (filteredDropdown.length === 0) return null;
        return (
            <div className={`nav-dropdown ${activeDropdown === item.name ? 'open' : ''}`}>
                {filteredDropdown.map((drop) => (
                    <NavLink
                        key={drop.path}
                        to={drop.path}
                        className={({ isActive }) => 
                            `dropdown-item ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setActiveDropdown(null)}
                    >
                        {drop.name}
                    </NavLink>
                ))}
            </div>
        );
    };
    return (
        <>
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={onMenuClick}>
                <FiMenu size={24} />
            </button>
            
            {/* Desktop Navigation */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <NavLink to="/dashboard" className="brand-link">
                        <span className="brand-icon">🎯</span>
                        <span className="brand-text">Falcon PMS</span>
                        {tenant && <span className="brand-tenant">{tenant.name}</span>}
                    </NavLink>
                </div>
                
                <ul className="navbar-nav">
                    {filteredItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            {item.path ? (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-name">{item.name}</span>
                                </NavLink>
                            ) : (
                                <div className="nav-dropdown-container">
                                    <button
                                        className={`nav-link dropdown-toggle ${activeDropdown === item.name ? 'active' : ''}`}
                                        onClick={(e) => toggleDropdown(item.name, e)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-name">{item.name}</span>
                                        <FiChevronDown className={`dropdown-arrow ${activeDropdown === item.name ? 'rotate' : ''}`} />
                                    </button>
                                    {renderDropdown(item)}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            
            {/* Mobile Navigation Menu */}
            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <span className="brand-text">Falcon PMS</span>
                    <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>
                
                <ul className="mobile-nav-items">
                    {filteredItems.map((item) => (
                        <li key={item.name} className="mobile-nav-item">
                            {item.path ? (
                                <NavLink
                                    to={item.path}
                                    className="mobile-nav-link"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-name">{item.name}</span>
                                </NavLink>
                            ) : (
                                <>
                                    <button
                                        className="mobile-nav-link dropdown-toggle"
                                        onClick={() => toggleDropdown(item.name, { stopPropagation: () => {} })}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-name">{item.name}</span>
                                        <FiChevronDown className={`dropdown-arrow ${activeDropdown === item.name ? 'rotate' : ''}`} />
                                    </button>
                                    {activeDropdown === item.name && item.dropdown && (
                                        <div className="mobile-dropdown">
                                            {item.dropdown.filter(drop => hasAccess(drop.roles)).map((drop) => (
                                                <NavLink
                                                    key={drop.path}
                                                    to={drop.path}
                                                    className="mobile-dropdown-link"
                                                    onClick={() => {
                                                        setMobileMenuOpen(false);
                                                        setActiveDropdown(null);
                                                    }}
                                                >
                                                    {drop.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}
        </>
    );
};
export default Navbar;