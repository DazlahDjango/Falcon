import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ComparisonSelector = ({ 
  comparisons, 
  selectedComparisonId,
  loading = false,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  title = 'Period Comparisons'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newComparisonName, setNewComparisonName] = useState('');
  const [newComparisonType, setNewComparisonType] = useState('mom');

  const comparisonTypes = {
    mom: { label: 'Month over Month', icon: '📅', description: 'Compare current month with previous month' },
    qoq: { label: 'Quarter over Quarter', icon: '📊', description: 'Compare current quarter with previous quarter' },
    yoy: { label: 'Year over Year', icon: '📈', description: 'Compare current year with previous year' },
    custom: { label: 'Custom Period', icon: '⚙️', description: 'Define custom date ranges' }
  };

  const selectedComparison = useMemo(() => {
    return comparisons?.find(c => c.id === selectedComparisonId);
  }, [comparisons, selectedComparisonId]);

  const handleCreate = async () => {
    if (!newComparisonName.trim()) return;
    await onCreate({
      name: newComparisonName,
      comparison_type: newComparisonType
    });
    setNewComparisonName('');
    setIsCreating(false);
  };

  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <span>
            {selectedComparison ? (
              <>
                <span style={{ marginRight: '8px' }}>{comparisonTypes[selectedComparison.comparison_type]?.icon}</span>
                {selectedComparison.name}
              </>
            ) : (
              <span style={{ color: '#64748b' }}>Select a comparison...</span>
            )}
          </span>
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {!isCreating ? (
              <>
                <button
                  onClick={() => setIsCreating(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f0fdf4',
                    cursor: 'pointer',
                    color: '#166534'
                  }}
                >
                  <FiPlus size={16} />
                  <span>Create New Comparison</span>
                </button>
                
                {comparisons?.map(comparison => (
                  <div
                    key={comparison.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      background: selectedComparisonId === comparison.id ? '#eff6ff' : 'white'
                    }}
                  >
                    <div
                      onClick={() => {
                        onSelect(comparison.id);
                        setIsOpen(false);
                      }}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{comparisonTypes[comparison.comparison_type]?.icon}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{comparison.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {comparisonTypes[comparison.comparison_type]?.label}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEdit?.(comparison)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete?.(comparison.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {(!comparisons || comparisons.length === 0) && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No comparisons yet. Create your first comparison.
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '16px' }}>
                <input
                  type="text"
                  placeholder="Comparison name"
                  value={newComparisonName}
                  onChange={(e) => setNewComparisonName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}
                  autoFocus
                />
                <select
                  value={newComparisonType}
                  onChange={(e) => setNewComparisonType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  {Object.entries(comparisonTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCreate}
                    disabled={!newComparisonName.trim()}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white',
                      cursor: newComparisonName.trim() ? 'pointer' : 'not-allowed',
                      opacity: newComparisonName.trim() ? 1 : 0.5
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedComparison && selectedComparison.cached_at && (
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
          Last calculated: {new Date(selectedComparison.cached_at).toLocaleString()}
        </div>
      )}
    </DashboardCard>
  );
};

ComparisonSelector.propTypes = {
  comparisons: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    comparison_type: PropTypes.string,
    cached_at: PropTypes.string
  })),
  selectedComparisonId: PropTypes.string,
  loading: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
  title: PropTypes.string
};