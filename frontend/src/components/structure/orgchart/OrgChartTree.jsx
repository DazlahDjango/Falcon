import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiRefreshCw,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiUser,
  FiBriefcase,
  FiFolder,
  FiFolderPlus,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiGrid,
  FiList,
  FiLayers,
  FiX,
  FiCheckCircle,
  FiShield,
  FiTarget,
  FiMapPin,
  FiMail,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { orgChartService } from '../../../services/structure/orgChart.service';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import {
  StructureLoading,
  StructureEmptyState,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './orgchart.css';

export const OrgChartTree = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const currentUserId = String(authUser?.id || '');

  const [treeType, setTreeType] = useState('people'); // 'people' (Reporting hierarchy) | 'department' (Org units)
  const [viewLayout, setViewLayout] = useState('canvas'); // 'canvas' | 'list'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);

  const [peopleTreeData, setPeopleTreeData] = useState([]);
  const [deptTreeData, setDeptTreeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load Tree Data from Backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [peopleRes, deptRes] = await Promise.all([
        orgChartService.getPeopleTree().catch(e => {
          console.warn('People tree fetch fallback:', e);
          return null;
        }),
        orgChartService.getTree().catch(e => {
          console.warn('Dept tree fetch fallback:', e);
          return null;
        }),
      ]);

      // 1. Process People Tree (Leadership & Reporting Lines)
      const rawPeople = peopleRes?.results || (Array.isArray(peopleRes) ? peopleRes : []);
      setPeopleTreeData(rawPeople);

      // 2. Process Department Tree (Units)
      let rawDepts = [];
      if (deptRes?.divisions) rawDepts = deptRes.divisions;
      else if (deptRes?.children) rawDepts = deptRes.children;
      else if (Array.isArray(deptRes)) rawDepts = deptRes;
      setDeptTreeData(rawDepts);

      // Auto-expand initial path to user in People tree
      const initialPeopleExpanded = {};
      const findAndExpandUser = (nodes) => {
        let inPath = false;
        nodes.forEach(n => {
          const isUser = String(n.user_id) === currentUserId || (n.email && n.email === authUser?.email);
          let childInPath = false;
          if (n.children && n.children.length > 0) {
            childInPath = findAndExpandUser(n.children);
          }
          if (isUser || childInPath) {
            initialPeopleExpanded[n.id || n.user_id] = true;
            inPath = true;
          }
        });
        return inPath;
      };

      const foundUser = findAndExpandUser(rawPeople);
      if (!foundUser && rawPeople.length > 0) {
        // Expand root CEO + first level of executives
        rawPeople.forEach(r => {
          initialPeopleExpanded[r.id || r.user_id] = true;
          r.children?.forEach(exec => {
            initialPeopleExpanded[exec.id || exec.user_id] = true;
          });
        });
      }
      setExpandedNodes(initialPeopleExpanded);
    } catch (err) {
      console.error('Failed to load organization tree:', err);
      setError(err?.message || 'Unable to load company organization tree.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, authUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active dataset based on treeType toggle
  const activeTreeData = treeType === 'people' ? peopleTreeData : deptTreeData;

  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }, []);

  const expandAll = useCallback(() => {
    const allExpanded = {};
    const expandRecursive = (nodes) => {
      nodes?.forEach(n => {
        const id = n.id || n.user_id || n.code;
        allExpanded[id] = true;
        if (n.children && n.children.length > 0) {
          expandRecursive(n.children);
        }
      });
    };
    expandRecursive(activeTreeData);
    setExpandedNodes(allExpanded);
  }, [activeTreeData]);

  const collapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  const focusOnMe = useCallback(() => {
    setTreeType('people');
    const myExpanded = {};
    const expandToMe = (nodes) => {
      let isFound = false;
      nodes.forEach(n => {
        const isMe = String(n.user_id) === currentUserId || (n.email && n.email === authUser?.email);
        let childFound = false;
        if (n.children && n.children.length > 0) {
          childFound = expandToMe(n.children);
        }
        if (isMe || childFound) {
          myExpanded[n.id || n.user_id] = true;
          isFound = true;
        }
      });
      return isFound;
    };
    expandToMe(peopleTreeData);
    setExpandedNodes(myExpanded);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [peopleTreeData, currentUserId, authUser]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Canvas Drag / Pan
  const handleMouseDown = (e) => {
    if (e.target.closest('.org-tree-person-card') || e.target.closest('.tree-action-btn')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const isMatch = (node) => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return (
      (node.name && node.name.toLowerCase().includes(term)) ||
      (node.position && node.position.toLowerCase().includes(term)) ||
      (node.department && node.department.toLowerCase().includes(term)) ||
      (node.email && node.email.toLowerCase().includes(term)) ||
      (node.code && node.code.toLowerCase().includes(term))
    );
  };

  // ============================================
  // RENDER PEOPLE / LEADERSHIP TREE NODE
  // ============================================
  const renderPeopleNode = (node) => {
    const nodeId = node.id || node.user_id;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[nodeId];
    const highlighted = isMatch(node);
    const isSelected = selectedNode && (selectedNode.id === node.id || selectedNode.user_id === node.user_id);
    const isSelf = String(node.user_id) === currentUserId || (node.email && node.email === authUser?.email);
    const isCEO = !node.reports_to && (node.position?.toLowerCase().includes('ceo') || node.position?.toLowerCase().includes('chief executive'));

    return (
      <div key={nodeId} className="visual-tree-branch" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Person Card */}
        <div
          className={`org-tree-person-card ${highlighted ? 'highlighted-node' : ''} ${isSelected ? 'selected-node' : ''}`}
          onClick={() => setSelectedNode(node)}
          style={{
            background: isSelf ? '#eff6ff' : isCEO ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#ffffff',
            color: isCEO ? '#ffffff' : '#0f172a',
            border: isSelf
              ? '2px solid #2563eb'
              : isCEO
              ? '2px solid #334155'
              : isSelected
              ? '2px solid #3b82f6'
              : '1px solid #e2e8f0',
            borderTop: isCEO
              ? '4px solid #f59e0b'
              : isSelf
              ? '4px solid #2563eb'
              : node.is_executive
              ? '4px solid #8b5cf6'
              : node.is_manager
              ? '4px solid #10b981'
              : '4px solid #64748b',
            borderRadius: '14px',
            padding: '16px',
            width: '240px',
            boxShadow: isSelf
              ? '0 0 0 3px rgba(37, 99, 235, 0.25), 0 8px 20px rgba(37, 99, 235, 0.15)'
              : isSelected
              ? '0 8px 24px rgba(59, 130, 246, 0.25)'
              : highlighted
              ? '0 0 0 3px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
            zIndex: 2,
          }}
        >
          {/* Header Row (Avatar & Badges) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: isCEO
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : isSelf
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : node.is_executive
                  ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  : node.is_manager
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : '#e2e8f0',
                color: isCEO || isSelf || node.is_executive || node.is_manager ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0,
                boxShadow: isSelf ? '0 2px 8px rgba(37,99,235,0.4)' : 'none',
              }}
            >
              {node.name ? node.name.charAt(0).toUpperCase() : <FiUser />}
            </div>

            {/* Role / Self Badge */}
            {isSelf ? (
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#2563eb', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiMapPin size={11} /> You (Self)
              </span>
            ) : isCEO ? (
              <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CEO / Leader
              </span>
            ) : node.is_executive ? (
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '6px' }}>
                Executive
              </span>
            ) : node.is_manager ? (
              <span style={{ fontSize: '10px', fontWeight: 600, background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px' }}>
                Manager
              </span>
            ) : (
              <span style={{ fontSize: '10px', fontWeight: 500, background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '6px' }}>
                Member
              </span>
            )}
          </div>

          {/* Full Name */}
          <div style={{ fontSize: '15px', fontWeight: 700, color: isCEO ? '#ffffff' : '#0f172a', lineHeight: '1.3', marginBottom: '4px' }}>
            {node.name}
          </div>

          {/* Position Title */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: isCEO ? '#94a3b8' : isSelf ? '#1d4ed8' : '#475569', lineHeight: '1.3', marginBottom: '8px' }}>
            {node.position || 'Position Title'}
          </div>

          {/* Department Tag */}
          {node.department && (
            <div style={{ fontSize: '11px', color: isCEO ? '#cbd5e1' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <HiOutlineBuildingOffice size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.department}</span>
            </div>
          )}

          {/* Bottom Reports Action Pill */}
          <div style={{ borderTop: isCEO ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: isCEO ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiUsers size={12} />
              {node.direct_reports_count || (node.children ? node.children.length : 0)} Reports
            </span>

            {hasChildren && (
              <button
                className="tree-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(nodeId);
                }}
                style={{
                  border: 'none',
                  background: isExpanded ? (isCEO ? '#334155' : '#e2e8f0') : (isCEO ? '#f59e0b' : '#3b82f6'),
                  color: isExpanded ? (isCEO ? '#e2e8f0' : '#475569') : '#ffffff',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title={isExpanded ? 'Collapse team reports' : 'Expand team reports'}
              >
                {isExpanded ? (
                  <>
                    <FiChevronDown size={12} /> Collapse
                  </>
                ) : (
                  <>
                    <FiChevronRight size={12} /> +{node.children.length}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Connected Children Branches */}
        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', position: 'relative' }}>
            {/* Top Connector Vertical Line */}
            <div style={{ width: '2px', height: '20px', background: '#cbd5e1', position: 'absolute', top: '-20px' }} />

            {/* Row of Direct Reports */}
            <div
              className="visual-tree-children-row"
              style={{
                display: 'flex',
                gap: '28px',
                position: 'relative',
                paddingTop: '20px',
              }}
            >
              {/* Horizontal Crossbar line connecting all sibling cards */}
              {node.children.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '120px',
                    right: '120px',
                    height: '2px',
                    background: '#cbd5e1',
                  }}
                />
              )}

              {node.children.map(child => (
                <div key={child.id || child.user_id} style={{ position: 'relative' }}>
                  {/* Vertical drop line to child card */}
                  <div style={{ width: '2px', height: '20px', background: '#cbd5e1', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }} />
                  {renderPeopleNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER OUTLINE LIST VIEW
  // ============================================
  const renderOutlineList = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : '24px', margin: 0 }}>
        {nodes.map(n => {
          const nodeId = n.id || n.user_id || n.code;
          const hasChildren = n.children && n.children.length > 0;
          const isExpanded = expandedNodes[nodeId];
          const highlighted = isMatch(n);
          const isSelf = String(n.user_id) === currentUserId || (n.email && n.email === authUser?.email);

          return (
            <li key={nodeId} style={{ marginBottom: '8px' }}>
              <div
                onClick={() => setSelectedNode(n)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: isSelf ? '#eff6ff' : highlighted ? '#fef3c7' : '#ffffff',
                  border: isSelf ? '2px solid #2563eb' : `1px solid ${highlighted ? '#f59e0b' : '#e2e8f0'}`,
                  borderLeft: isSelf ? '4px solid #2563eb' : n.is_executive ? '4px solid #8b5cf6' : n.is_manager ? '4px solid #10b981' : '4px solid #3b82f6',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(nodeId);
                      }}
                      style={{
                        border: 'none',
                        background: '#f1f5f9',
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                    </button>
                  ) : (
                    <div style={{ width: '24px' }} />
                  )}

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelf ? '#2563eb' : n.is_executive ? '#8b5cf6' : n.is_manager ? '#10b981' : '#e2e8f0',
                      color: isSelf || n.is_executive || n.is_manager ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {n.name ? n.name.charAt(0).toUpperCase() : <FiUser size={14} />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                      {n.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {n.position || n.code || 'Position'} {n.department ? `• ${n.department}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSelf && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#2563eb', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                      📍 You (Self)
                    </span>
                  )}
                  {hasChildren && (
                    <span style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>
                      {n.children.length} direct reports
                    </span>
                  )}
                </div>
              </div>

              {hasChildren && isExpanded && (
                <div style={{ borderLeft: '2px dashed #e2e8f0', marginLeft: '12px', marginTop: '6px' }}>
                  {renderOutlineList(n.children, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="orgchart-tree-container">
        <StructureLoading text="Generating interactive company organization hierarchy..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orgchart-tree-container">
        <div className="orgchart-tree-error" style={{ padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '16px' }}>{error}</p>
          <button onClick={loadData} className="btn btn-primary" style={{ marginTop: '12px' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orgchart-tree-container" style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      {/* Header */}
      <div className="orgchart-tree-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiLayers className="text-primary" />
            Company Organization Tree
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Complete enterprise hierarchy from Executive Leadership down to departments and teams
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tree Structure Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setTreeType('people')}
              style={{
                border: 'none',
                background: treeType === 'people' ? '#2563eb' : 'transparent',
                color: treeType === 'people' ? '#ffffff' : '#64748b',
                boxShadow: treeType === 'people' ? '0 1px 3px rgba(37,99,235,0.3)' : 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <FiUsers size={15} /> People & Leadership
            </button>
            <button
              onClick={() => setTreeType('department')}
              style={{
                border: 'none',
                background: treeType === 'department' ? '#2563eb' : 'transparent',
                color: treeType === 'department' ? '#ffffff' : '#64748b',
                boxShadow: treeType === 'department' ? '0 1px 3px rgba(37,99,235,0.3)' : 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <HiOutlineBuildingOffice size={15} /> Department Units
            </button>
          </div>

          {/* Focus on Me Action Button */}
          <button
            onClick={focusOnMe}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Focus tree on your position & leadership chain"
          >
            <FiTarget size={15} /> Focus on Me
          </button>

          {/* Layout Mode (Canvas vs List) */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewLayout('canvas')}
              style={{
                border: 'none',
                background: viewLayout === 'canvas' ? '#fff' : 'transparent',
                boxShadow: viewLayout === 'canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewLayout === 'canvas' ? '#2563eb' : '#64748b',
              }}
              title="Interactive Canvas View"
            >
              <FiGrid size={15} />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              style={{
                border: 'none',
                background: viewLayout === 'list' ? '#fff' : 'transparent',
                boxShadow: viewLayout === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewLayout === 'list' ? '#2563eb' : '#64748b',
              }}
              title="Directory List View"
            >
              <FiList size={15} />
            </button>
          </div>

          <button onClick={expandAll} className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '13px' }}>
            Expand All
          </button>
          <button onClick={collapseAll} className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '13px' }}>
            Collapse All
          </button>
          <button onClick={loadData} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Toolbar & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by person name, position, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> Executive
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} /> Leadership
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Manager
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} /> You (Self)
          </span>
        </div>
      </div>

      {/* Main Canvas / List Area */}
      <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
        {viewLayout === 'canvas' ? (
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              flex: 1,
              background: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              minHeight: '660px',
              overflow: 'hidden',
              position: 'relative',
              cursor: isPanning ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
          >
            {/* Canvas Zoom Floating Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 10,
              }}
            >
              <button
                onClick={handleZoomIn}
                style={{ border: 'none', background: 'transparent', padding: '6px 8px', cursor: 'pointer', borderRadius: '6px', color: '#475569' }}
                title="Zoom In"
              >
                <FiZoomIn size={16} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomOut}
                style={{ border: 'none', background: 'transparent', padding: '6px 8px', cursor: 'pointer', borderRadius: '6px', color: '#475569' }}
                title="Zoom Out"
              >
                <FiZoomOut size={16} />
              </button>
              <button
                onClick={handleResetZoom}
                style={{ border: 'none', background: 'transparent', padding: '6px 8px', cursor: 'pointer', borderRadius: '6px', color: '#475569' }}
                title="Reset View"
              >
                <FiMaximize2 size={16} />
              </button>
            </div>

            {/* Scaled & Panned Canvas */}
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: isPanning ? 'none' : 'transform 0.1s ease',
                padding: '50px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100%',
              }}
            >
              {activeTreeData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {activeTreeData.map(rootNode => renderPeopleNode(rootNode))}
                </div>
              ) : (
                <StructureEmptyState
                  title="No Organization Nodes Found"
                  description="No hierarchical members found for this organization."
                />
              )}
            </div>
          </div>
        ) : (
          /* List Outline View */
          <div
            style={{
              flex: 1,
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              minHeight: '520px',
            }}
          >
            {activeTreeData.length > 0 ? (
              renderOutlineList(activeTreeData)
            ) : (
              <StructureEmptyState
                title="No Organization Members Found"
                description="No organizational hierarchy records found."
              />
            )}
          </div>
        )}

        {/* Quick Details Flyout Sidebar (When any card is clicked) */}
        {selectedNode && (
          <div
            style={{
              width: '320px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', background: '#dbeafe', padding: '3px 8px', borderRadius: '4px' }}>
                {String(selectedNode.user_id) === currentUserId ? 'Your Profile' : 'Member Details'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                {selectedNode.name ? selectedNode.name.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {selectedNode.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {selectedNode.position || 'Position'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              {selectedNode.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <FiMail size={14} style={{ color: '#94a3b8' }} />
                  <span>{selectedNode.email}</span>
                </div>
              )}
              {selectedNode.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <HiOutlineBuildingOffice size={14} style={{ color: '#94a3b8' }} />
                  <span>{selectedNode.department}</span>
                </div>
              )}
              {selectedNode.division && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <FiBriefcase size={14} style={{ color: '#94a3b8' }} />
                  <span>{selectedNode.division}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
                <span style={{ color: '#64748b' }}>Direct Reports:</span>
                <strong style={{ color: '#0f172a' }}>{selectedNode.direct_reports_count || (selectedNode.children ? selectedNode.children.length : 0)}</strong>
              </div>
            </div>

            {selectedNode.children && selectedNode.children.length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Direct Team Members ({selectedNode.children.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {selectedNode.children.map(child => (
                    <div
                      key={child.id || child.user_id}
                      onClick={() => setSelectedNode(child)}
                      style={{
                        padding: '8px 10px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{child.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{child.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChartTree;
