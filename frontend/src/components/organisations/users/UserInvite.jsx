import React, { useState, useEffect } from 'react';
import { userApi, departmentApi, positionApi } from '../../../services/organisations';
import UserRoleBadge from './components/UserRoleBadge';
import toast from 'react-hot-toast';

const UserInvite = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'staff',
    department: '',
    position: '',
    send_email: true,
    message: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, positionsRes] = await Promise.all([
        departmentApi.getAll(),
        positionApi.getAll(),
      ]);
      setDepartments(deptsRes.data.results || deptsRes.data || []);
      setPositions(positionsRes.data.results || positionsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.invite(formData);
      setInvitedEmail(formData.email);
      setInviteSuccess(true);
      setFormData({
        email: '',
        name: '',
        role: 'staff',
        department: '',
        position: '',
        send_email: true,
        message: '',
      });
      toast.success(`Invitation sent to ${formData.email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAnother = () => {
    setInviteSuccess(false);
    setInvitedEmail('');
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin', icon: '👑', description: 'Full access to all features and settings' },
    { value: 'manager', label: 'Manager', icon: '📊', description: 'Can manage teams, view reports, and approve KPIs' },
    { value: 'staff', label: 'Staff', icon: '👤', description: 'Can view and update own KPIs' },
    { value: 'viewer', label: 'Viewer', icon: '👁️', description: 'Read-only access to dashboards and reports' },
    { value: 'dashboard_champion', label: 'Dashboard Champion', icon: '🏆', description: 'Can manage organisation-wide KPIs and targets' },
  ];

  if (inviteSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow text-center p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Sent!</h2>
          <p className="text-gray-500 mb-4">
            An invitation has been sent to <strong>{invitedEmail}</strong>
          </p>
          <div className="space-y-3">
            <button
              onClick={handleInviteAnother}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Invite Another User
            </button>
            <div>
              <a href="/users" className="text-sm text-indigo-600 hover:text-indigo-900">
                View All Users →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invite Team Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Invite new users to join your organisation
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Invitation Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="colleague@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <div className="space-y-3">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.role === role.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <UserRoleBadge role={role.value} size="md" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Personal Message (Optional)
            </label>
            <textarea
              name="message"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add a personal note to the invitation..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="send_email"
              checked={formData.send_email}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Send invitation email immediately</span>
          </label>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              📧 The user will receive an email invitation with a link to set up their account.
              They will be automatically added to your organisation upon completion.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <a
              href="/users"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInvite;