import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { fetchUsers, deleteUser, setFilters, resetFilters } from '../../../store/accounts/slice/userSlice';
import UserCard from './components/UserCard';
import UserFilters from './components/UserFilters';
import InviteUserModal from './components/InviteUserModal';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';

const UserList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, pagination, filters, isLoading } = useSelector((state) => state.user);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [showFilters, setShowFilters] = useState(false);
    const [showInviteModal, setShowInviteModla] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        dispatch(fetchUsers({ ...filters, search: searchTerm}));
    }, [dispatch, filters, searchTerm]);
    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchUsers({ ...filters, search: searchTerm }));
    };
    const handleFilterChange = (newFilters) => {
        dispatch(setFilters(newFilters));
    };
    const handleResetFilters = () => {
        dispatch(resetFilters());
        setSearchTerm('');
    };
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await dispatch(deleteUser(userId));
        }
    };
    const canManageUsers = currentUser?.role === 'client_admin' || currentUser?.role === 'super_admin';
    if (isLoading && !users.length) {
        return (
            <div className="users-page">
                <div className="page-header">
                    <h1>Users</h1>
                </div>
                <SkeletonLoader type="list" count={5} />
            </div>
        );
    }
    return (
        <div className="users-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage and invite team members</p>
                </div>
                {canManageUsers && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <FiPlus size={16} />
                        Invite User
                    </button>
                )}
            </div>
            {/* Search and Filters Bar */}
            <div className="search-filters-bar">
                <form onSubmit={handleSearch} className="search-form">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </form>
                <button 
                    className={`filter-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FiFilter size={16} />
                    Filters
                </button>
                <button className="export-btn" onClick={() => {}}>
                    <FiDownload size={16} />
                    Export
                </button>
            </div>
            {/* Filters Panel */}
            {showFilters && (
                <UserFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />
            )}
            {/* Users Grid */}
            {users.length === 0 ? (
                <EmptyState 
                    title="No users found"
                    description="Try adjusting your search or filters"
                    action={canManageUsers}
                    actionText="Invite User"
                    onAction={() => setShowInviteModal(true)}
                />
            ) : (
                <div className="users-grid">
                    {users.map((user) => (
                        <UserCard 
                            key={user.id}
                            user={user}
                            onEdit={() => navigate(`/users/${user.id}/edit`)}
                            onDelete={() => handleDeleteUser(user.id)}
                            showActions={canManageUsers}
                        />
                    ))}
                </div>
            )}
            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="pagination">
                    <button 
                        className="pagination-btn"
                        disabled={pagination.current_page === 1}
                        onClick={() => dispatch(fetchUsers({ ...filters, page: pagination.current_page - 1 }))}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <button 
                        className="pagination-btn"
                        disabled={pagination.current_page === pagination.total_pages}
                        onClick={() => dispatch(fetchUsers({ ...filters, page: pagination.current_page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}
            {/* Invite Modal */}
            <InviteUserModal 
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={() => dispatch(fetchUsers(filters))}
            />
        </div>
    );
};
export default UserList;