import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiMapPin,
  FiGlobe,
  FiPhone,
  FiMail,
  FiUsers,
  FiClock,
  FiPlus,
} from 'react-icons/fi';
import { useLocations } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureConfirmDialog,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './location.css';

export const LocationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    remove,
    clearError,
  } = useLocations({ autoFetch: false });

  useEffect(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.LOCATIONS);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(STRUCTURE_ROUTES.LOCATION_EDIT(id));
  }, [navigate, id]);

  const handleAddSubLocation = useCallback(() => {
    navigate(STRUCTURE_ROUTES.LOCATION_CREATE + '?parent_id=' + id);
  }, [navigate, id]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove(id);
      navigate(STRUCTURE_ROUTES.LOCATIONS);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [id, remove, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (id) {
      fetchById(id);
    }
  }, [id, fetchById]);

  if (isLoading) {
    return (
      <div className="location-detail-loading">
        <StructureLoading text="Loading location details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-detail-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <StructureEmptyState
        title="Location Not Found"
        description="The location you are looking for does not exist."
        actionLabel="Back to Locations"
        onAction={handleBack}
      />
    );
  }

  const DetailRow = ({ label, value, children }) => (
    <div className="detail-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children || value || '-'}</div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'primary', suffix = '' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}{suffix}</span>
      </div>
    </div>
  );

  const occupancyRate = currentItem.seating_capacity && currentItem.seating_capacity > 0
    ? Math.round((currentItem.current_occupancy / currentItem.seating_capacity) * 100)
    : null;

  const getOccupancyColor = () => {
    if (!occupancyRate) return 'secondary';
    if (occupancyRate < 60) return 'success';
    if (occupancyRate < 80) return 'warning';
    return 'danger';
  };

  const getAddressDisplay = () => {
    const parts = [
      currentItem.address_line1,
      currentItem.address_line2,
      currentItem.city,
      currentItem.state_province,
      currentItem.postal_code,
      currentItem.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  return (
    <div className="location-detail-container">
      <div className="location-detail-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <FiArrowLeft size={18} />
            Back
          </button>
          <h1>{currentItem.name}</h1>
          <StructureStatusBadge
            status={currentItem.is_active ? 'active' : 'inactive'}
            size="lg"
          />
          {currentItem.is_headquarters && (
            <span className="headquarters-badge">Headquarters</span>
          )}
          <span className={`location-type-badge type-${currentItem.type}`}>
            {currentItem.type || 'branch'}
          </span>
        </div>
        <div className="header-right">
          <button onClick={handleAddSubLocation} className="btn btn-secondary" title="Add Sub-Location">
            <FiPlus size={16} />
            <span className="hidden-sm">Add Sub-Location</span>
          </button>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
          <button onClick={handleEdit} className="btn btn-primary">
            <FiEdit size={16} />
            Edit
          </button>
          <button onClick={handleDeleteClick} className="btn btn-danger">
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="location-detail-body">
        <div className="stats-grid">
          <StatCard
            icon={FiUsers}
            label="Seating Capacity"
            value={currentItem.seating_capacity || 'N/A'}
            color="primary"
          />
          <StatCard
            icon={FiUsers}
            label="Current Occupancy"
            value={currentItem.current_occupancy || 0}
            color="secondary"
          />
          <StatCard
            icon={FiUsers}
            label="Occupancy Rate"
            value={occupancyRate !== null ? `${occupancyRate}%` : 'N/A'}
            color={getOccupancyColor()}
          />
          <StatCard
            icon={FiClock}
            label="Timezone"
            value={currentItem.timezone || 'N/A'}
            color="secondary"
          />
        </div>

        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <DetailRow label="Code" value={currentItem.code} />
            <DetailRow label="Name" value={currentItem.name} />
            <DetailRow label="Type" value={currentItem.type || 'branch'} />
            <DetailRow label="Organizational Unit" value={currentItem.organizational_unit_name || 'Not Assigned'} />
            <DetailRow label="Parent Location" value={currentItem.parent_name || 'None'} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Address Information</h3>
          <div className="address-display">
            <div className="address-full">
              <FiMapPin className="address-icon" />
              <span>{getAddressDisplay()}</span>
            </div>
          </div>
          <div className="detail-grid">
            <DetailRow label="Address Line 1" value={currentItem.address_line1} />
            <DetailRow label="Address Line 2" value={currentItem.address_line2} />
            <DetailRow label="City" value={currentItem.city} />
            <DetailRow label="State/Province" value={currentItem.state_province} />
            <DetailRow label="Postal Code" value={currentItem.postal_code} />
            <DetailRow label="Country" value={currentItem.country} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Contact Information</h3>
          <div className="detail-grid">
            <DetailRow label="Phone Number">
              {currentItem.phone_number ? (
                <a href={`tel:${currentItem.phone_number}`} className="contact-link">
                  <FiPhone size={14} />
                  {currentItem.phone_number}
                </a>
              ) : '-'}
            </DetailRow>
            <DetailRow label="Email Address">
              {currentItem.email ? (
                <a href={`mailto:${currentItem.email}`} className="contact-link">
                  <FiMail size={14} />
                  {currentItem.email}
                </a>
              ) : '-'}
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Occupancy Details</h3>
          <div className="detail-grid">
            <DetailRow label="Seating Capacity" value={currentItem.seating_capacity || 'N/A'} />
            <DetailRow label="Current Occupancy" value={currentItem.current_occupancy || 0} />
            <DetailRow label="Occupancy Rate">
              {occupancyRate !== null ? (
                <div className="occupancy-indicator">
                  <div className="occupancy-bar-wrapper">
                    <div
                      className={`occupancy-bar occupancy-${getOccupancyColor()}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  <span className="occupancy-percentage">{occupancyRate}%</span>
                </div>
              ) : 'N/A'}
            </DetailRow>
          </div>
        </div>

        <div className="detail-section">
          <h3>Sub-Locations</h3>
          <div className="detail-grid">
            <DetailRow label="Sub-Location Count" value={currentItem.sub_location_count || 0} />
          </div>
        </div>

        <div className="detail-section">
          <h3>Audit Information</h3>
          <div className="detail-grid">
            <DetailRow label="Created At" value={new Date(currentItem.created_at).toLocaleString()} />
            <DetailRow label="Updated At" value={currentItem.updated_at ? new Date(currentItem.updated_at).toLocaleString() : '-'} />
            <DetailRow label="Status">
              <StructureStatusBadge
                status={currentItem.is_active ? 'active' : 'inactive'}
              />
            </DetailRow>
          </div>
        </div>
      </div>

      <StructureConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        message={`Are you sure you want to delete "${currentItem.name}"? This will remove the location and all associated data. This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default LocationDetail;
