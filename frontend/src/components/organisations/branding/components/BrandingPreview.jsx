import React from 'react';

const BrandingPreview = ({ branding }) => {
  const previewStyles = {
    '--primary': branding.primary_color || '#3B82F6',
    '--secondary': branding.secondary_color || '#10B981',
    '--accent': branding.accent_color || '#F59E0B',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4" style={previewStyles}>
      <h3 className="text-lg font-medium text-gray-900 mb-3">Live Preview</h3>
      
      <div className="space-y-4">
        {/* Header Preview */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            {branding.logo_url && (
              <img src={branding.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
            )}
            <span className="font-semibold" style={{ color: 'var(--primary)' }}>
              Falcon PMS
            </span>
          </div>
        </div>

        {/* Button Preview */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Primary Button:</p>
          <button
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Primary Action
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Secondary Button:</p>
          <button
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            Secondary Action
          </button>
        </div>

        {/* Accent Preview */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Accent Element:</p>
          <div className="flex space-x-2">
            <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: 'var(--accent)' }}>
              Accent Badge
            </span>
            <span className="px-2 py-1 rounded text-xs" style={{ color: 'var(--accent)' }}>
              Accent Text
            </span>
          </div>
        </div>

        {/* Font Preview */}
        {branding.font_family && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Font Preview:</p>
            <p className="text-lg" style={{ fontFamily: branding.font_family }}>
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingPreview;