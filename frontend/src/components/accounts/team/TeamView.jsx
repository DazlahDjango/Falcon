import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiUserPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import TeamTree from './TeamTree';
import TeamStats from './components/TeamStats';
import TeamMemberCard from './components/TeamMemberCard';
import { fetchTeamHierarchy, fetchTeamStats } from '../../../store/accounts/slice/teamSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';
import EmptyState from '../../common/Feedback/EmptyState';
import InviteUserModal from '../users/components/InviteUserModal';

const TeamView = () => {
    const dispatch = useDispatch();
    const { hierarchy, stats, isLoading } = useSelector((state) => state.accTeam);
    const { user } = useSelector((state) => state.auth);
    const [viewMode, setViewMode] = useState('tree');
    const [searchTerm, setSearchTerm] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    useEffect(() => {
        dispatch(fetchTeamHierarchy());
        dispatch(fetchTeamStats());
    }, [dispatch]);
    const canInvite = user?.role === 'client_admin' || user?.role === 'super_admin' || user?.role === 'supervisor';
    if (isLoading && !hierarchy) {
        return (
            <div className="team-view">
                <SkeletonLoader type='list' count={5} />
            </div>
        );
    }
    return (
        <div className="team-view">
            {/* Header */}
            <div className="team-header">
                <div>
                    <h1>Team Management</h1>
                    <p>View and manage your team hierarchy</p>
                </div>
                {canInvite && (
                    <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                        <FiUserPlus size={16} />
                        Invite Member
                    </button>
                )}
            </div>
            
            {/* Stats Row */}
            <TeamStats stats={stats} />
            
            {/* Controls */}
            <div className="team-controls">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="view-toggle">
                    <button 
                        className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
                        onClick={() => setViewMode('tree')}
                    >
                        Tree View
                    </button>
                    <button 
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        Grid View
                    </button>
                </div>
                <button className="export-btn">
                    <FiDownload size={16} />
                    Export
                </button>
            </div>
            
            {/* Content */}
            {viewMode === 'tree' ? (
                <TeamTree 
                    data={hierarchy} 
                    searchTerm={searchTerm}
                    onMemberSelect={setSelectedMember}
                />
            ) : (
                <div className="team-grid">
                    {hierarchy?.members?.filter(member => 
                        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(member => (
                        <TeamMemberCard 
                            key={member.id} 
                            member={member}
                            onClick={() => setSelectedMember(member)}
                        />
                    ))}
                    {(!hierarchy?.members || hierarchy.members.length === 0) && (
                        <EmptyState 
                            title="No team members"
                            description="Your team is empty. Invite members to get started."
                            action={canInvite}
                            actionText="Invite Member"
                            onAction={() => setShowInviteModal(true)}
                        />
                    )}
                </div>
            )}
            
            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="member-modal" onClick={() => setSelectedMember(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedMember(null)}>×</button>
                        <TeamMemberCard member={selectedMember} detailed />
                        <div className="member-actions">
                            <button className="btn btn-primary btn-sm">View Full Profile</button>
                            <button className="btn btn-secondary btn-sm">Send Message</button>
                            <button className="btn btn-secondary btn-sm">Assign Task</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Invite Modal */}
            <InviteUserModal 
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onSuccess={() => {
                    dispatch(fetchTeamHierarchy());
                    dispatch(fetchTeamStats());
                }}
            />
        </div>
    );
};
export default TeamView;