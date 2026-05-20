import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiStar, FiTrash2, FiGripVertical, FiSearch } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const FavoriteKPIManager = ({ 
  favorites, 
  availableKPIs = [],
  loading = false,
  error = null,
  onAdd,
  onRemove,
  onReorder,
  onRefresh,
  title = 'Favorite KPIs'
}) => {
  const [dragIndex, setDragIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null) return;
    
    const draggedItem = favorites[dragIndex];
    const targetItem = favorites[index];
    
    if (draggedItem && targetItem && dragIndex !== index) {
      const reordered = [...favorites];
      reordered.splice(dragIndex, 1);
      reordered.splice(index, 0, draggedItem);
      onReorder(reordered.map((item, idx) => item.id));
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const filteredAvailableKPIs = availableKPIs.filter(kpi => 
    !favorites.some(f => f.kpi_id === kpi.id) &&
    (kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     kpi.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddKPI = (kpi) => {
    onAdd(kpi.id, kpi.name);
    setShowAddModal(false);
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={4} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load favorites" message={error} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px'
          }}
        >
          <FiStar size={12} />
          Add KPI
        </button>
      }
    >
      {favorites.length === 0 ? (
        <EmptyState 
          icon="⭐" 
          title="No Favorite KPIs" 
          message="Add KPIs to quickly access your most important metrics." 
          actionLabel="Add KPI"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div>
          {favorites.map((favorite, index) => (
            <div
              key={favorite.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                marginBottom: '8px',
                background: dragIndex === index ? '#eff6ff' : 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'grab',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ cursor: 'grab', color: '#94a3b8' }}>
                <FiGripVertical size={16} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{favorite.kpi_name}</div>
                {favorite.notes && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {favorite.notes}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Order: {favorite.order}
                </span>
                <button
                  onClick={() => onRemove(favorite.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            💡 Drag and drop to reorder favorites
          </div>
        </div>
      )}
      
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Add Favorite KPI</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 36px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {filteredAvailableKPIs.map(kpi => (
                  <div
                    key={kpi.id}
                    onClick={() => handleAddKPI(kpi)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{kpi.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{kpi.category || 'Uncategorized'}</div>
                    </div>
                    <button
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
              
              {filteredAvailableKPIs.length === 0 && (
                <EmptyState 
                  title="No KPIs Available" 
                  message={searchTerm ? `No KPIs found matching "${searchTerm}"` : "All KPIs are already in favorites"} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

FavoriteKPIManager.propTypes = {
  favorites: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    kpi_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    kpi_name: PropTypes.string,
    order: PropTypes.number,
    notes: PropTypes.string
  })),
  availableKPIs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    category: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
  title: PropTypes.string
};