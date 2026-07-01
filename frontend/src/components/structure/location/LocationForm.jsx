import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiGlobe, FiPhone, FiMail } from 'react-icons/fi';
import { useLocations, useStructureForm } from '../../../hooks/structure';
import { StructureForm, StructureLoading, StructureEmptyState } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './location.css';

export const LocationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    currentItem,
    isLoading,
    error,
    fetchById,
    create,
    update,
    clearError,
  } = useLocations({ autoFetch: false });

  const { values, handleChange, handleSubmit, setFieldValue, resetForm, isSubmitting } = useStructureForm({
    initialValues: {
      code: '',
      name: '',
      type: 'branch',
      organizational_unit_id: '',
      parent_id: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
      timezone: 'Africa/Nairobi',
      is_headquarters: false,
      is_active: true,
      seating_capacity: '',
      current_occupancy: 0,
      phone_number: '',
      email: '',
    },
    onSubmit: async (formData) => {
      const submitData = {
        ...formData,
        seating_capacity: formData.seating_capacity ? parseInt(formData.seating_capacity, 10) : null,
        current_occupancy: parseInt(formData.current_occupancy, 10) || 0,
      };
      if (isEditing) {
        await update(id, submitData);
      } else {
        await create(submitData);
      }
      navigate(STRUCTURE_ROUTES.LOCATIONS);
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchById(id);
    }
  }, [isEditing, id, fetchById]);

  useEffect(() => {
    if (currentItem && isEditing) {
      resetForm({
        code: currentItem.code || '',
        name: currentItem.name || '',
        type: currentItem.type || 'branch',
        organizational_unit_id: currentItem.organizational_unit_id || '',
        parent_id: currentItem.parent_id || '',
        address_line1: currentItem.address_line1 || '',
        address_line2: currentItem.address_line2 || '',
        city: currentItem.city || '',
        state_province: currentItem.state_province || '',
        postal_code: currentItem.postal_code || '',
        country: currentItem.country || '',
        timezone: currentItem.timezone || 'Africa/Nairobi',
        is_headquarters: currentItem.is_headquarters || false,
        is_active: currentItem.is_active !== undefined ? currentItem.is_active : true,
        seating_capacity: currentItem.seating_capacity || '',
        current_occupancy: currentItem.current_occupancy || 0,
        phone_number: currentItem.phone_number || '',
        email: currentItem.email || '',
      });
    }
  }, [currentItem, isEditing, resetForm]);

  const handleCancel = useCallback(() => {
    navigate(STRUCTURE_ROUTES.LOCATIONS);
  }, [navigate]);

  const locationTypes = [
    { value: 'headquarters', label: 'Headquarters' },
    { value: 'regional', label: 'Regional Office' },
    { value: 'branch', label: 'Branch Office' },
    { value: 'remote', label: 'Remote Hub' },
    { value: 'satellite', label: 'Satellite Office' },
  ];

  const timezones = [
    'Africa/Nairobi',
    'Africa/Lagos',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Toronto',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  if (isLoading) {
    return (
      <div className="location-form-loading">
        <StructureLoading text="Loading location..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-form-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (isEditing && !currentItem) {
    return (
      <StructureEmptyState
        title="Location Not Found"
        description="The location you are looking for does not exist."
        actionLabel="Back to Locations"
        onAction={handleCancel}
      />
    );
  }

  return (
    <div className="location-form-container">
      <div className="location-form-header">
        <button onClick={handleCancel} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Location' : 'Create Location'}</h1>
      </div>

      <StructureForm
        title={isEditing ? `Editing: ${currentItem?.name}` : 'New Location'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={isEditing}
      >
        <div className="form-group">
          <label htmlFor="code">
            Code <span className="required">*</span>
          </label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="e.g., LOC-001"
            value={values.code || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <span className="form-hint">Unique identifier for the location</span>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Nairobi Headquarters"
            value={values.name || ''}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">
            Location Type <span className="required">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={values.type || 'branch'}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {locationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="organizational_unit_id">Organizational Unit</label>
          <input
            id="organizational_unit_id"
            name="organizational_unit_id"
            type="text"
            placeholder="Org unit ID"
            value={values.organizational_unit_id || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="parent_id">Parent Location</label>
          <input
            id="parent_id"
            name="parent_id"
            type="text"
            placeholder="Parent location ID"
            value={values.parent_id || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span className="form-hint">Leave empty for top-level location</span>
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="address_line1">Address Line 1</label>
          <input
            id="address_line1"
            name="address_line1"
            type="text"
            placeholder="Street address"
            value={values.address_line1 || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="address_line2">Address Line 2</label>
          <input
            id="address_line2"
            name="address_line2"
            type="text"
            placeholder="Apartment, suite, unit, etc."
            value={values.address_line2 || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <div className="input-with-icon">
            <FiMapPin className="input-icon" size={16} />
            <input
              id="city"
              name="city"
              type="text"
              placeholder="City"
              value={values.city || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="state_province">State/Province</label>
          <input
            id="state_province"
            name="state_province"
            type="text"
            placeholder="State or province"
            value={values.state_province || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postal_code">Postal Code</label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            placeholder="Postal/ZIP code"
            value={values.postal_code || ''}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">
            Country <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <FiGlobe className="input-icon" size={16} />
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Country"
              value={values.country || ''}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={values.timezone || 'Africa/Nairobi'}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <div className="input-with-icon">
            <FiPhone className="input-icon" size={16} />
            <input
              id="phone_number"
              name="phone_number"
              type="text"
              placeholder="+254 700 000 000"
              value={values.phone_number || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" size={16} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="location@company.com"
              value={values.email || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="seating_capacity">Seating Capacity</label>
          <input
            id="seating_capacity"
            name="seating_capacity"
            type="number"
            placeholder="Maximum seating capacity"
            value={values.seating_capacity || ''}
            onChange={handleChange}
            min="0"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="current_occupancy">Current Occupancy</label>
          <input
            id="current_occupancy"
            name="current_occupancy"
            type="number"
            placeholder="Current number of occupants"
            value={values.current_occupancy || 0}
            onChange={handleChange}
            min="0"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_headquarters"
              type="checkbox"
              checked={values.is_headquarters || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Headquarters</span>
          </label>
          <span className="form-hint">Designate as the main headquarters</span>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              name="is_active"
              type="checkbox"
              checked={values.is_active || false}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Active</span>
          </label>
        </div>
      </StructureForm>
    </div>
  );
};

export default LocationForm;