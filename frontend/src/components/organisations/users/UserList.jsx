import React, { useState, useEffect } from 'react';
import UserCard from './components/UserCard';
import UserFilters from './components/UserFilters';
import InviteUserModal from './components/InviteUserModal';
import UserForm from './components/UserForm';
import { userApi, departmentApi, positionApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes, positionsRes] = await Promise.all([
        userApi.getAll(filters),
        departmentApi.getAll(),
        positionApi.getAll(),
      ]);
      setUsers(usersRes.data.results || usersRes.data || []);
      setDepartments(deptsRes.data.results || deptsRes.data || []);
      setPositions(positionsRes.data.results || positionsRes.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (inviteData) => {
    setFormLoading(true);
    try {
      await userApi.invite(inviteData);
      toast.success(`Invitation sent to ${inviteData.email}`);
      setShowInviteModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdate = async (userData) => {
    setFormLoading(true);
    try {
      await userApi.update(editingUser.id, userData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to remove ${user.name || user.email}?`)) return;
    try {
      await userApi.delete(user.id);
      toast.success('User removed successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleResendInvite = async (user) => {
    try {
      await userApi.resendInvite(user.id);
      toast.success(`Invitation resent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      department: '',
    });
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const pendingInvites = users.filter(u => u.is_invited && !u.is_verified).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organisation's users and their roles
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          <p className="text-xs text-green-600">Active</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingInvites}</p>
          <p className="text-xs text-yellow-600">Pending Invites</p>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        departments={departments}
      />

      {/* User List */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by inviting your first team member.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Invite User
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResendInvite={handleResendInvite}
            />
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          onInvite={handleInvite}
          onClose={() => setShowInviteModal(false)}
          loading={formLoading}
          departments={departments}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <UserForm
          user={editingUser}
          departments={departments}
          positions={positions}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default UserList;