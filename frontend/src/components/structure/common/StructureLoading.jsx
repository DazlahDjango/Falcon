import React from 'react';

export const StructureLoading = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-6 w-6 border-b-2',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-b-2',
  };
  const spinnerSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col justify-center items-center gap-3 p-8 ${fullPage ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : ''} ${className}`}>
      <div className={`animate-spin rounded-full border-blue-600 ${spinnerSize}`} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
};

export default StructureLoading;
