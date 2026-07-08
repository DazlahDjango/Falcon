import React from 'react';

export const StructureLoading = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = '',
}) => {
  const sizeClass = `loading-${size}`;

  if (fullPage) {
    return (
      <div className={`structure-loading-full ${className}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClass}`} />
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`structure-loading ${className}`}>
      <div className={`loading-spinner ${sizeClass}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default StructureLoading;