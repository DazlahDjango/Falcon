import React, { useState, useRef } from 'react';

const LogoUploader = ({ currentLogo, onUpload, onRemove, loading }) => {
  const [preview, setPreview] = useState(currentLogo);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Organisation Logo
      </label>
      
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="h-24 w-24 object-contain border border-gray-200 rounded-lg p-2"
            />
          ) : (
            <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Uploading...' : 'Upload Logo'}
          </button>
          {currentLogo && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
            >
              Remove
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500">
            Recommended size: 200x200px. Max file size: 2MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;