/**
 * Organisation Users Page
 * Manage team members, roles, and invitations
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganisationUsers } from '../../store/organisation/slice/userSlice';
import { UserList, UserInvite, UserRoles } from '../../components/Organisation/users';

const userTabs = [
  { id: 'list', label: 'All Users', icon: '👥', description: 'View and manage all team members', component: UserList },
  { id: 'invite', label: 'Invite User', icon: '📧', description: 'Invite new members to join', component: UserInvite },
  { id: 'roles', label: 'User Roles', icon: '👑', description: 'Manage user permissions and roles', component: UserRoles },
];

const OrganisationUsersPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('list');
  const { users, loading, total } = useSelector((state) => state.orgUsers);

  useEffect(() => {
    dispatch(fetchOrganisationUsers());
  }, [dispatch]);

  const ActiveComponent = userTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organisation's users, roles, and invitations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{total || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{users?.filter(u => u.is_active).length || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600">Pending Invites</p>
          <p className="text-2xl font-bold text-yellow-600">{users?.filter(u => u.is_invited && !u.is_verified).length || 0}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {userTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mt-4 mb-6">
        <p className="text-sm text-gray-500">
          {userTabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && <ActiveComponent users={users} loading={loading} />}
    </div>
  );
};

export default OrganisationUsersPage;