import React, { useState, useEffect } from 'react';
import { useHierarchy } from '../../../hooks/organisations';
import { Card, CardHeader, CardTitle, CardContent } from '../../../common/UI/Card';
import { Button } from '../../../common/UI/Button';
import { Badge } from '../../../common/UI/Badge';
import { Loader2, Users, ChevronDown, ChevronRight } from 'lucide-react';

const HierarchyChart = () => {
  const { hierarchy, loading, error, fetchHierarchy } = useHierarchy();
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (user, level = 0) => {
    const hasChildren = user.direct_reports && user.direct_reports.length > 0;
    const isExpanded = expandedNodes.has(user.id);
    const indent = level * 24;

    return (
      <div key={user.id} className="hierarchy-node">
        <div
          className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => hasChildren && toggleNode(user.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4 mr-2" />
          )}

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.full_name}</div>
              <div className="text-sm text-gray-500">{user.position?.title || 'No Position'}</div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {user.role?.name || 'Member'}
            </Badge>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {user.direct_reports.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading organisation hierarchy...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <p>Failed to load hierarchy</p>
            <Button
              variant="outline"
              onClick={fetchHierarchy}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Organisation Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hierarchy && hierarchy.length > 0 ? (
          <div className="space-y-1">
            {hierarchy.map(user => renderNode(user))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hierarchy data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HierarchyChart;