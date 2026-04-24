import React, { useState, useEffect } from 'react';
import ColorPicker from './components/ColorPicker';
import LogoUploader from './components/LogoUploader';
import BrandingPreview from './components/BrandingPreview';
import { brandingApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const BrandingEditor = () => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    font_family: 'Inter',
    is_white_labeled: false,
    powered_by_falcon: true,
  });

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const response = await brandingApi.get();
      const data = response.data;
      setBranding(data);
      setFormData({
        primary_color: data.primary_color || '#3B82F6',
        secondary_color: data.secondary_color || '#10B981',
        accent_color: data.accent_color || '#F59E0B',
        font_family: data.font_family || 'Inter',
        is_white_labeled: data.is_white_labeled || false,
        powered_by_falcon: data.powered_by_falcon !== false,
      });
    } catch (error) {
      console.error('Error fetching branding:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    try {
      const response = await brandingApi.uploadLogo(file);
      setBranding({ ...branding, logo_url: response.data.logo_url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      await brandingApi.removeLogo();
      setBranding({ ...branding, logo_url: null });
      toast.success('Logo removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Remove failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await brandingApi.update(formData);
      toast.success('Branding settings saved successfully');
      fetchBranding();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Nunito', label: 'Nunito' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your organisation's visual identity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Customization</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <LogoUploader
              currentLogo={branding?.logo_url}
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
              loading={uploading}
            />

            <ColorPicker
              label="Primary Color"
              value={formData.primary_color}
              onChange={(value) => handleChange('primary_color', value)}
            />

            <ColorPicker
              label="Secondary Color"
              value={formData.secondary_color}
              onChange={(value) => handleChange('secondary_color', value)}
            />

            <ColorPicker
              label="Accent Color"
              value={formData.accent_color}
              onChange={(value) => handleChange('accent_color', value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={formData.font_family}
                onChange={(e) => handleChange('font_family', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_white_labeled}
                    onChange={(e) => handleChange('is_white_labeled', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    White Label Mode (Remove Falcon branding)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.powered_by_falcon}
                    onChange={(e) => handleChange('powered_by_falcon', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Show "Powered by Falcon" in footer
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <BrandingPreview branding={formData} />
      </div>

      {/* CSS Variables Preview */}
      <div className="mt-8 bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">CSS Variables</h3>
        <code className="text-xs text-gray-300 block">
          {`:root {
  --primary: ${formData.primary_color};
  --secondary: ${formData.secondary_color};
  --accent: ${formData.accent_color};
  --font-family: ${formData.font_family};
}`}
        </code>
      </div>
    </div>
  );
};

export default BrandingEditor;