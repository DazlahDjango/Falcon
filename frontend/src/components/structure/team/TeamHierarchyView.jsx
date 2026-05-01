import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Users, UserCheck } from 'lucide-react';
import TeamBadge from '../common/TeamBadge';

const TeamHierarchyView = ({ teams, onSelectTeam, defaultExpanded = false, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };
  const buildTree = (teamsList) => {
    const teamMap = new Map();
    const roots = [];
    teamsList.forEach(team => {
      teamMap.set(team.id, { ...team, children: [] });
    });
    teamsList.forEach(team => {
      if (team.parent_team_id && teamMap.has(team.parent_team_id)) {
        teamMap.get(team.parent_team_id).children.push(teamMap.get(team.id));
      } else {
        roots.push(teamMap.get(team.id));
      }
    });
    return roots;
  };

  const renderNode = (node) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.id} className="ml-4">
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer group"
          onClick={() => onSelectTeam?.(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <Users size={14} className="text-green-500" />
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-gray-400 ml-2">({node.code})</span>
          {node.team_lead && (
            <UserCheck size={12} className="text-blue-500 ml-1" title="Has Team Lead" />
          )}
          {node.member_count > 0 && (
            <span className="text-xs text-gray-500 ml-auto">{node.member_count} members</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };
  if (!teams || teams.length === 0) {
    return <div className="text-center text-gray-500 py-8">No teams found</div>;
  }
  const tree = buildTree(teams);
  return (
    <div className={`team-hierarchy-view ${className}`}>
      {tree.map(root => renderNode(root))}
    </div>
  );
};
export default TeamHierarchyView;