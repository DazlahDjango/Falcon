import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiMoreVertical, FiShield, FiLock, FiCheckCircle } from 'react-icons/fi';
import UserRoleBadge from './UserRoleBadge';
import UserStatusBadge from './UserStatusBadge';

const UserCard = ({ user, onEdit, onDelete, showActions = false, onClick, currentUserId }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick(user);
        } else {
            navigate(`/users/${user.id}`);
        }
    };

    const getInitials = () => {
        if (user.first_name && user.last_name) {
            return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
        }
        return user.email?.charAt(0).toUpperCase() || 'U';
    };

    const isCurrentUser = currentUserId === user.id;

    return (
        <div className="user-card" onClick={handleClick}>
            <div className="user-card-avatar">
                <div className="avatar-initials">
                    {getInitials()}
                </div>
                {showActions && !isCurrentUser && (
                    <div className="card-actions">
                        <button
                            className="action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <FiMoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="action-menu">
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.();
                                    setShowMenu(false);
                                }}>
                                    <FiEdit size={14} />
                                    Edit
                                </button>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.();
                                    setShowMenu(false);
                                }} className="danger">
                                    <FiTrash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="user-card-info">
                <h4>
                    {user.full_name || user.username}
                    {isCurrentUser && <span className="current-badge">You</span>}
                </h4>
                <p className="user-email">{user.email}</p>
                <div className="user-badges">
                    <UserRoleBadge role={user.role} />
                    <UserStatusBadge isActive={user.is_active} />
                    {user.mfa_enabled && (
                        <span className="badge-sm badge-success">
                            <FiShield size={12} /> MFA
                        </span>
                    )}
                    {user.locked_until && (
                        <span className="badge-sm badge-warning">
                            <FiLock size={12} /> Locked
                        </span>
                    )}
                </div>
                {user.title && <p className="user-title">{user.title}</p>}
                {user.department && <p className="user-dept">{user.department}</p>}
                <div className="user-meta">
                    <span>Joined {new Date(user.joined_at || user.created_at).toLocaleDateString()}</span>
                    {user.last_login && (
                        <span>Last active {new Date(user.last_login).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCard;