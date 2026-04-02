import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash, FiMoreVertical } from "react-icons/fi";
import UserRoleBadge from './UserRoleBadge';
import UserStatusBadge from './UserStatusBadge';
import { use } from "react";

const UserCard = ({ user, onEdit, onDelete, showActions = false, onClick, showKpiSumary = false }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = React.useState(false);
    const handleClick = () => {
        if (onClick) {
            onClick(user);
        } else {
            navigate(`/users/${user.id}`);
        }
    };
    return (
        <div className="user-card" onClick={handleClick}>
            <div className="user-card-avatar">
                <img 
                    src={user.avatar_url || '/static/accounts/img/default-avatar.png'} 
                    alt={user.full_name}
                />
                {showActions && (
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
                                <button onClick={(e) => { e.stopPropagation(); onEdit?.(); setShowMenu(false); }}>
                                    <FiEdit size={14} />
                                    Edit
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowMenu(false); }}>
                                    <FiTrash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="user-card-info">
                <h4>{user.full_name}</h4>
                <p className="user-email">{user.email}</p>
                <div className="user-badges">
                    <UserRoleBadge role={user.role} />
                    <UserStatusBadge isActive={user.is_active} />
                </div>
                {user.title && <p className="user-title">{user.title}</p>}
                {showKpiSummary && user.kpi_score !== undefined && (
                    <div className="kpi-summary">
                        <div className="kpi-score">Score: {user.kpi_score}%</div>
                        <div className="kpi-progress-bar">
                            <div className="kpi-progress" style={{ width: `${user.kpi_score}%` }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default UserCard