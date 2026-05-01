import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, MapPin, AlertCircle } from 'lucide-react';
import { useLocation, useLocationMutations, useLocations } from '../../hooks/structure';
import { CountrySelector, TimezoneSelector } from '../../components/structure/location';
import { createLocation, updateLocation } from '../../store/structure';
import { showToast } from '../../store/ui/slices/uiSlice';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';
import { LOCATION_TYPE, LOCATION_TYPE_LABELS } from '../../config/constants/structureConstants';

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;
  const { data: existingLocation, isLoading: isLoadingLocation } = useLocation(id, { enabled: isEditMode });
  const { data: locations } = useLocations({ page: 1, pageSize: 1000 });
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'branch',
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
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditMode && existingLocation) {
      setFormData({
        code: existingLocation.code || '',
        name: existingLocation.name || '',
        type: existingLocation.type || 'branch',
        parent_id: existingLocation.parent_id || '',
        address_line1: existingLocation.address_line1 || '',
        address_line2: existingLocation.address_line2 || '',
        city: existingLocation.city || '',
        state_province: existingLocation.state_province || '',
        postal_code: existingLocation.postal_code || '',
        country: existingLocation.country || '',
        timezone: existingLocation.timezone || 'Africa/Nairobi',
        is_headquarters: existingLocation.is_headquarters || false,
        is_active: existingLocation.is_active,
        seating_capacity: existingLocation.seating_capacity || '',
        current_occupancy: existingLocation.current_occupancy || 0,
        phone_number: existingLocation.phone_number || '',
        email: existingLocation.email || '',
      });
    }
  }, [isEditMode, existingLocation]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseInt(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleCountryChange = (country) => {
    setFormData(prev => ({ ...prev, country }));
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: '' }));
    }
  };
  const handleTimezoneChange = (timezone) => {
    setFormData(prev => ({ ...prev, timezone }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Location code is required';
    if (!formData.name.trim()) newErrors.name = 'Location name is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (formData.seating_capacity !== '' && formData.seating_capacity < 0) {
      newErrors.seating_capacity = 'Seating capacity cannot be negative';
    }
    if (formData.current_occupancy < 0) newErrors.current_occupancy = 'Occupancy cannot be negative';
    if (formData.seating_capacity !== '' && formData.current_occupancy > formData.seating_capacity) {
      newErrors.current_occupancy = 'Occupancy cannot exceed seating capacity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      type: formData.type,
      parent_id: formData.parent_id || null,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2,
      city: formData.city,
      state_province: formData.state_province,
      postal_code: formData.postal_code,
      country: formData.country,
      timezone: formData.timezone,
      is_headquarters: formData.is_headquarters,
      is_active: formData.is_active,
      seating_capacity: formData.seating_capacity === '' ? null : formData.seating_capacity,
      current_occupancy: formData.current_occupancy,
      phone_number: formData.phone_number,
      email: formData.email,
    };
    try {
      if (isEditMode) {
        await dispatch(updateLocation({ id, data: submitData })).unwrap();
        dispatch(showToast({ message: 'Location updated successfully', type: 'success' }));
      } else {
        await dispatch(createLocation(submitData)).unwrap();
        dispatch(showToast({ message: 'Location created successfully', type: 'success' }));
      }
      navigate(STRUCTURE_ROUTES.LOCATIONS);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save location' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate(STRUCTURE_ROUTES.LOCATIONS);
  };
  const handleHeadquartersChange = (checked) => {
    setFormData(prev => ({ ...prev, is_headquarters: checked }));
  };
  if (isEditMode && isLoadingLocation) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }
  const availableParents = locations?.filter(loc => !isEditMode || loc.id !== id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-100 rounded-lg">
          <MapPin size={20} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Location' : 'Add Location'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? 'Update location information' : 'Add a new office or facility location'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., NBO-001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditMode}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Nairobi Headquarters"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Location
              </label>
              <select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None</option>
                {availableParents?.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              placeholder="Street address, P.O. Box"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              placeholder="Suite, floor, building"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
              <input
                type="text"
                name="state_province"
                value={formData.state_province}
                onChange={handleChange}
                placeholder="State or Province"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="Postal Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <CountrySelector
                value={formData.country}
                onChange={handleCountryChange}
                placeholder="Select country"
              />
              {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <TimezoneSelector
                value={formData.timezone}
                onChange={handleTimezoneChange}
                placeholder="Select timezone"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                name="seating_capacity"
                value={formData.seating_capacity}
                onChange={handleNumberChange}
                min="0"
                placeholder="Maximum seating capacity"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.seating_capacity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.seating_capacity && <p className="mt-1 text-sm text-red-500">{errors.seating_capacity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Occupancy</label>
              <input
                type="number"
                name="current_occupancy"
                value={formData.current_occupancy}
                onChange={handleNumberChange}
                min="0"
                placeholder="Current number of employees"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.current_occupancy ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.current_occupancy && <p className="mt-1 text-sm text-red-500">{errors.current_occupancy}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+254 XXX XXX XXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="location@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_headquarters"
                checked={formData.is_headquarters}
                onChange={(e) => handleHeadquartersChange(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Headquarters</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Location' : 'Create Location')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default LocationForm;