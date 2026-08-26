import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiEdit,
  FiArrowLeft,
  FiShield,
  FiAward,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTool,
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { UserAvatar } from '../common/UserAvatar';
import { UserRoleBadge } from '../users/UserRoleBadge';
import { UserStatusBadge } from '../users/UserStatusBadge';
import { SkillManager } from './SkillManager';
import { CertificationManager } from './CertificationManager';
import { AvatarUpload } from './AvatarUpload';
import { ACCOUNTS_ROUTES } from '../../../config/constants/accountsRouteConstants';

export const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    selectedProfile: profile,
    isLoading,
    error,
    getProfile,
    getMyProfile,
    currentProfile,
    clearSelectedProfile,
    clearError,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (userId) {
      if (isOwnProfile) {
        getMyProfile();
      } else {
        getProfile(userId);
      }
    }
    return () => clearSelectedProfile();
  }, [userId, isOwnProfile, getProfile, getMyProfile, clearSelectedProfile]);

  const displayProfile = isOwnProfile ? currentProfile : profile;

  if (isLoading && !displayProfile) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{typeof error === 'string' ? error : (error?.displayMessage || error?.message || error?.detail || error?.error || JSON.stringify(error))}</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE)}>
          <FiArrowLeft /> Back to Profile
        </button>
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className="profile-empty">
        <FiUser className="empty-icon" />
        <p>Profile not found</p>
        <button className="btn-primary" onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE)}>
          <FiArrowLeft /> Back to Profile
        </button>
      </div>
    );
  }

  const profileAvatar = displayProfile?.avatar || displayProfile?.user?.avatar || currentUser?.avatar;
  const user = {
    ...(displayProfile.user || displayProfile),
    avatar: profileAvatar,
  };
  const profileData = displayProfile;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCompletionPercentage = () => {
    const fields = [
      user?.first_name,
      user?.last_name,
      profileData?.bio,
      profileData?.date_of_birth,
      profileData?.work_phone,
      profileData?.mobile_phone,
      profileData?.address,
      profileData?.city,
      profileData?.country,
      profileData?.employee_type,
      profileData?.skills?.length > 0,
      profileData?.certifications?.length > 0,
    ];
    const completed = fields.filter(f => f !== null && f !== undefined && f !== '' && f !== false);
    return Math.round((completed.length / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <div className="profile-container">
      <div className="profile-header-actions">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        {isOwnProfile && (
          <button
            className="btn-primary"
            onClick={() => navigate(ACCOUNTS_ROUTES.MY_PROFILE_EDIT || '/profile/edit')}
          >
            <FiEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-cover" />
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <UserAvatar user={user} avatar={profileAvatar} size="2xl" />
            {isOwnProfile && (
              <button
                className="avatar-upload-btn"
                onClick={() => setShowAvatarUpload(true)}
                title="Upload avatar"
              >
                <FiEdit />
              </button>
            )}
          </div>
          <div className="profile-name-section">
            <h1 className="profile-name">
              {user?.full_name || user?.first_name || user?.email}
            </h1>
            <div className="profile-badges">
              <UserRoleBadge role={user?.role} />
              <UserStatusBadge
                isActive={user?.is_active !== false}
                isVerified={user?.is_verified === true}
              />
              <span className="profile-completion">
                {completion}% Complete
              </span>
            </div>
            <p className="profile-email">
              <FiMail /> {user?.email}
            </p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <FiBriefcase className="detail-icon" />
            <div>
              <label>Department</label>
              <span>{profileData?.department || user?.department || '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiBriefcase className="detail-icon" />
            <div>
              <label>Job Title</label>
              <span>{profileData?.title || user?.title || '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiShield className="detail-icon" />
            <div>
              <label>Employee Type</label>
              <span>{profileData?.employee_type || '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiCalendar className="detail-icon" />
            <div>
              <label>Date of Birth</label>
              <span>{profileData?.date_of_birth ? formatDate(profileData.date_of_birth) : '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiPhone className="detail-icon" />
            <div>
              <label>Work Phone</label>
              <span>{profileData?.work_phone || '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiPhone className="detail-icon" />
            <div>
              <label>Mobile Phone</label>
              <span>{profileData?.mobile_phone || '-'}</span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiMapPin className="detail-icon" />
            <div>
              <label>Location</label>
              <span>
                {[profileData?.city, profileData?.country].filter(Boolean).join(', ') || '-'}
              </span>
            </div>
          </div>
          <div className="profile-detail-item">
            <FiClock className="detail-icon" />
            <div>
              <label>Joined</label>
              <span>{user?.created_at ? formatDate(user.created_at) : '-'}</span>
            </div>
          </div>
        </div>

        {profileData?.bio && (
          <div className="profile-bio">
            <h3>About</h3>
            <p>{profileData.bio}</p>
          </div>
        )}
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiUser /> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <FiTool /> Skills
        </button>
        <button
          className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          <FiAward /> Certifications
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-section">
              <h3>Contact Information</h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className="overview-item">
                  <label>Work Phone</label>
                  <span>{profileData?.work_phone || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>Mobile Phone</label>
                  <span>{profileData?.mobile_phone || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>Address</label>
                  <span>{profileData?.address || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>City</label>
                  <span>{profileData?.city || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>Country</label>
                  <span>{profileData?.country || '-'}</span>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Employment Details</h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <label>Employee ID</label>
                  <span>{user?.employee_id || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>Employee Type</label>
                  <span>{profileData?.employee_type || '-'}</span>
                </div>
                <div className="overview-item">
                  <label>Cost Center</label>
                  <span>{profileData?.cost_center || '-'}</span>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Preferences</h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <label>Theme</label>
                  <span>{profileData?.theme || 'Light'}</span>
                </div>
                <div className="overview-item">
                  <label>Time Zone</label>
                  <span>{profileData?.timezone || 'Africa/Nairobi'}</span>
                </div>
                <div className="overview-item">
                  <label>Date Format</label>
                  <span>{profileData?.date_format || 'MM/DD/YYYY'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <SkillManager
            profileId={profileData?.id || user?.id}
            skills={profileData?.skills || []}
            isOwner={isOwnProfile}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationManager
            profileId={profileData?.id || user?.id}
            certifications={profileData?.certifications || []}
            isOwner={isOwnProfile}
          />
        )}
      </div>

      {showAvatarUpload && (
        <AvatarUpload
          profileId={profileData?.id || user?.id}
          currentAvatar={profileAvatar}
          onClose={() => setShowAvatarUpload(false)}
          onSuccess={() => {
            setShowAvatarUpload(false);
            if (isOwnProfile) {
              getMyProfile();
            } else {
              getProfile(userId);
            }
          }}
        />
      )}
    </div>
  );
};
export default ProfileView;