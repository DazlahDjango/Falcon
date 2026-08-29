import React from 'react';
import CascadeHierarchyTree from './CascadeHierarchyTree';

const CascadeTree = ({ tree, onNodeClick, onRefresh, onExport }) => {
    return (
        <CascadeHierarchyTree 
            tree={tree} 
            onNodeSelect={onNodeClick} 
            onRefresh={onRefresh}
            onExport={onExport}
        />
    );
};

export default CascadeTree;