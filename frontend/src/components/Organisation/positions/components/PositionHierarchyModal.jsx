import React from 'react';

const PositionHierarchyModal = ({ position, positions, onClose }) => {
  // Build hierarchy tree
  const buildHierarchyTree = (posId, visited = new Set()) => {
    if (visited.has(posId)) return null;
    visited.add(posId);
    
    const pos = positions.find(p => p.id === posId);
    if (!pos) return null;
    
    const subordinates = positions.filter(p => p.reports_to === posId);
    
    return {
      ...pos,
      children: subordinates.map(sub => buildHierarchyTree(sub.id, visited)).filter(Boolean),
    };
  };

  const findRootPosition = () => {
    // Find position with no reports_to (top of hierarchy)
    const topPosition = positions.find(p => !p.reports_to);
    if (topPosition) return buildHierarchyTree(topPosition.id);
    
    // If no top position found, build from selected position
    return buildHierarchyTree(position.id);
  };

  const hierarchy = findRootPosition();

  const renderHierarchyNode = (node, level = 0) => {
    if (!node) return null;
    
    return (
      <div key={node.id} className="ml-4" style={{ marginLeft: level * 24 }}>
        <div className={`border-l-2 pl-4 py-2 ${level > 0 ? 'border-indigo-200' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              node.is_management 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {node.level}
            </div>
            <div>
              <p className="font-medium text-gray-900">{node.title}</p>
              <p className="text-xs text-gray-500">{node.department_name}</p>
            </div>
            {node.id === position.id && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                Current
              </span>
            )}
          </div>
        </div>
        {node.children?.map(child => renderHierarchyNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Position Hierarchy: {position?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {hierarchy ? (
            renderHierarchyNode(hierarchy)
          ) : (
            <p className="text-center text-gray-500 py-8">No hierarchy data available</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PositionHierarchyModal;