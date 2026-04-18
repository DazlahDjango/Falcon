import React, { useState, useEffect } from 'react';
import TeamCard from './components/TeamCard';
import TeamForm from './components/TeamForm';
import TeamMembersModal from './components/TeamMembersModal';
import { teamApi, departmentApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const TeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, deptsRes] = await Promise.all([
        teamApi.getAll(),
        departmentApi.getAll(),
      ]);
      setTeams(teamsRes.data.results || teamsRes.data || []);
      setDepartments(deptsData.data.results || deptsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = async (team) => {
    if (!confirm(`Are you sure you want to delete ${team.name}?`)) return;
    try {
      await teamApi.delete(team.id);
      toast.success('Team deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleViewMembers = async (team) => {
    setSelectedTeam(team);
    try {
      const response = await teamApi.getMembers(team.id);
      setTeamMembers(response.data || []);
      setShowMembersModal(true);
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await teamApi.addMember(selectedTeam.id, userId);
      toast.success('Member added successfully');
      const response = await teamApi.getMembers(selectedTeam.id);
      setTeamMembers(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await teamApi.removeMember(selectedTeam.id, userId);
      toast.success('Member removed successfully');
      const response = await teamApi.getMembers(selectedTeam.id);
      setTeamMembers(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingTeam) {
        await teamApi.update(editingTeam.id, formData);
        toast.success('Team updated successfully');
      } else {
        await teamApi.create(formData);
        toast.success('Team created successfully');
      }
      setShowForm(false);
      setEditingTeam(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage teams within your departments
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Add Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
          <p className="text-xs text-gray-500">Total Teams</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {teams.filter(t => t.team_lead).length}
          </p>
          <p className="text-xs text-blue-600">With Team Lead</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{departments.length}</p>
          <p className="text-xs text-green-600">Departments</p>
        </div>
      </div>

      {/* Team List */}
      {teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewMembers={handleViewMembers}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTeam(null);
                }}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            <TeamForm
              team={editingTeam}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTeam(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <TeamMembersModal
          team={selectedTeam}
          members={teamMembers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedTeam(null);
            setTeamMembers([]);
          }}
        />
      )}
    </div>
  );
};

export default TeamManager;