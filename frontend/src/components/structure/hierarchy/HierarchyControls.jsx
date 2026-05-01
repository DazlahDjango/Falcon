import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Download, Maximize2 } from 'lucide-react';

const HierarchyControls = ({ onZoomIn, onZoomOut, onReset, onExport, onFullscreen, className = '' }) => {
  return (
    <div className={`hierarchy-controls ${className}`}>
      <button onClick={onZoomIn} className="control-button" title="Zoom In">
        <ZoomIn size={16} />
      </button>
      <button onClick={onZoomOut} className="control-button" title="Zoom Out">
        <ZoomOut size={16} />
      </button>
      <button onClick={onReset} className="control-button" title="Reset View">
        <RefreshCw size={16} />
      </button>
      <button onClick={onExport} className="control-button" title="Export">
        <Download size={16} />
      </button>
      <button onClick={onFullscreen} className="control-button" title="Fullscreen">
        <Maximize2 size={16} />
      </button>
    </div>
  );
};
export default HierarchyControls;