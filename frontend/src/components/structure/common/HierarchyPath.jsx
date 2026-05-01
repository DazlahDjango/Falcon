import React from 'react';
import { ChevronRight } from 'lucide-react';

const HierarchyPath = ({ path, onNavigate, separator = 'chevron', className = '' }) => {
  if (!path || path.length === 0) {
    return null;
  }
  const renderSeparator = (index) => {
    if (separator === 'chevron') {
      return <ChevronRight size={14} className="hierarchy-path-separator" />;
    }
    return <span className="hierarchy-path-separator">/</span>;
  };
  const handleClick = (item, index) => {
    if (onNavigate && item.id) {
      onNavigate(item.id, index);
    }
  };
  return (
    <nav className={`hierarchy-path ${className}`}>
      {path.map((item, index) => (
        <React.Fragment key={item.id || index}>
          {index > 0 && renderSeparator(index)}
          <span
            className="hierarchy-path-item"
            onClick={() => handleClick(item, index)}
            style={{ cursor: onNavigate && item.id ? 'pointer' : 'default' }}
          >
            {item.name || item.label || item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default HierarchyPath;