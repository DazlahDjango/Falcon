import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userApi, departmentApi, positionApi } from '../../../services/organisations';
import UserRoleBadge from './components/UserRoleBadge';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchDepartments();
    fetchPositions();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userApi.getById(id);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        role: response.data.role || 'staff',
        department: response.data.department || '',
        position: response.data.position || '',
        is_active: response.data.is_active !== false,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionApi.getAll();
      setPositions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await userApi.update(id, formData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await userApi.toggleStatus(id);
      toast.success(`User ${action}d successfully`);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleResendInvite = async () => {
    try {
      await userApi.resendInvite(id);
      toast.success('Invitation resent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Link to="/users" className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link to="/users" className="text-sm text-indigo-600 hover:text-indigo-900">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">User Details</h1>
        </div>
        <div className="flex space-x-3">
          {user.is_invited && !user.is_verified && (
            <button
              onClick={handleResendInvite}
              className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
            >
              Resend Invite
            </button>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit User
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-3xl">
                  {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    <UserRoleBadge role={user.role || 'staff'} size="md" />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.department_name || 'Not assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.position_title || 'Not assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{user.kpi_count || 0}</p>
          <p className="text-xs text-gray-500">KPIs Owned</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{user.login_count || 0}</p>
          <p className="text-xs text-gray-500">Total Logins</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{user.approvals_pending || 0}</p>
          <p className="text-xs text-gray-500">Pending Approvals</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {user.recent_activity?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent activity</div>
          ) : (
            user.recent_activity?.map((activity, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-xl">
                      {activity.action === 'login' ? '🔑' : 
                       activity.action === 'kpi_updated' ? '📊' : 
                       activity.action === 'review_completed' ? '✅' : '📋'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                  <option value="dashboard_champion">Dashboard Champion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active Account</span>
              </label>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;