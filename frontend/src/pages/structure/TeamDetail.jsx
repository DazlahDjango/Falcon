import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus, Edit2, ArrowLeft, Trash2, ChevronRight, Home, Crown, Calendar } from 'lucide-react';
import { TeamBadge, EmployeeAvatar } from '../../components/structure/common';
import { TeamMembersList, AddMemberModal, RemoveMemberModal } from '../../components/structure/team';
import { ConfirmDeleteModal } from '../../components/structure/modals';
import { useTeam, useTeamMembers, useTeamMutations, useEmployments } from '../../hooks/structure';
import { fetchTeamById, deleteTeam, addTeamMember, removeTeamMember } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const TeamDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { data: team, isLoading: isLoadingTeam, refetch } = useTeam(id);
  const { data: members, isLoading: isLoadingMembers, refetch: refetchMembers } = useTeamMembers(id);
  const { data: availableEmployees } = useEmployments({ 
    filters: { is_active: 'true', is_current: 'true' },
    page: 1, 
    pageSize: 100 
  });
  const handleBack = () => {
    navigate(STRUCTURE_ROUTES.TEAMS);
  };
  const handleEdit = () => {
    navigate(STRUCTURE_ROUTES.TEAM_EDIT(id));
  };
  const handleAddMember = async (userId) => {
    await dispatch(addTeamMember({ id, userId })).unwrap();
    setShowAddMemberModal(false);
    refetchMembers();
    dispatch(showToast({ message: 'Member added successfully', type: 'success' }));
  };
  const handleRemoveMember = async (userId) => {
    await dispatch(removeTeamMember({ id, userId })).unwrap();
    setShowRemoveMemberModal(false);
    setSelectedMember(null);
    refetchMembers();
    dispatch(showToast({ message: 'Member removed successfully', type: 'success' }));
  };
  const handleDelete = async () => {
    await dispatch(deleteTeam(id)).unwrap();
    navigate(STRUCTURE_ROUTES.TEAMS);
  };
  const handleSetTeamLead = async (userId) => {
    await dispatch(updateTeam({ id, data: { team_lead: userId } })).unwrap();
    refetch();
    dispatch(showToast({ message: 'Team lead updated', type: 'success' }));
  };
  const availableMembersList = availableEmployees?.filter(
    emp => !members?.some(m => m.user_id === emp.user_id)
  ) || [];
  if (isLoadingTeam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Team not found</p>
        <button onClick={handleBack} className="mt-3 text-blue-600 hover:text-blue-700">
          Back to Teams
        </button>
      </div>
    );
  }
  const memberCount = members?.length || 0;
  const utilization = team.max_members ? Math.round((memberCount / team.max_members) * 100) : null;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/app/structure')} className="hover:text-blue-600">
            <Home size={14} />
          </button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(STRUCTURE_ROUTES.TEAMS)} className="hover:text-blue-600">
            Teams
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{team.name}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <TeamBadge team={team} size="lg" />
              </div>
              <p className="text-gray-500 mt-1">{team.description || 'No description'}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {memberCount} members
                </span>
                {team.max_members && (
                  <span className="flex items-center gap-1">
                    📊 {utilization}% capacity
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Created {new Date(team.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
            >
              <UserPlus size={14} /> Add Member
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
        {team.max_members && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Team Capacity</span>
              <span className={`font-medium ${utilization >= 90 ? 'text-red-600' : utilization >= 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                {utilization}% used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  utilization >= 90 ? 'bg-red-500' : utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {memberCount} of {team.max_members} positions filled
            </p>
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <UserPlus size={14} /> Add Member
          </button>
        </div>

        {isLoadingMembers ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : members?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No members in this team</p>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add first member →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Member</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Position</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar user={member} size="sm" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {member.name || member.user_id}
                            {member.user_id === team.team_lead && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Crown size={10} /> Team Lead
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{member.department_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.position_title || 'Not assigned'}
                    </td>
                    <td className="px-4 py-3">
                      {member.is_manager && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manager</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {member.user_id !== team.team_lead && (
                          <button
                            onClick={() => handleSetTeamLead(member.user_id)}
                            className="text-xs text-amber-600 hover:text-amber-700"
                            title="Set as Team Lead"
                          >
                            <Crown size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRemoveMemberModal(true);
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                          title="Remove from Team"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        team={team}
        availableMembers={availableMembersList}
        onAdd={handleAddMember}
      />
      <RemoveMemberModal
        isOpen={showRemoveMemberModal}
        onClose={() => {
          setShowRemoveMemberModal(false);
          setSelectedMember(null);
        }}
        team={team}
        member={selectedMember}
        onRemove={handleRemoveMember}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to delete "${team.name}"?`}
        itemName={team.name}
      />
    </div>
  );
};
export default TeamDetail;