import React, { useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import SectorCard from './SectorCard';
import SectorForm from './SectorForm';
import SectorDeleteConfirm from './SectorDeleteConfirm';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPISearchBar from '../../common/KPISearchBar';

const SectorList = ({ 
    sectors, 
    loading, 
    onCreate, 
    onUpdate, 
    onDelete,
    canManage 
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingSector, setEditingSector] = useState(null);
    const [deletingSector, setDeletingSector] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSectors = sectors?.filter(sector =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <KPILoading text="Loading sectors..." />;
    }

    return (
        <div className="kpi-sectors-container">
            <div className="kpi-sectors-header">
                <div>
                    <h2>Sectors</h2>
                    <p>Manage business sectors and industry verticals</p>
                </div>
                {canManage && (
                    <button className="kpi-sectors-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={16} />
                        Add Sector
                    </button>
                )}
            </div>
            
            <div className="kpi-sectors-toolbar">
                <KPISearchBar 
                    value={searchTerm}
                    onSearch={setSearchTerm}
                    placeholder="Search sectors by name or code..."
                />
            </div>
            
            {filteredSectors?.length === 0 ? (
                <KPIEmptyState 
                    icon="🏭"
                    title="No Sectors Found"
                    description={searchTerm ? "No sectors match your search" : "No sectors have been created yet"}
                    actionText={canManage ? "Create Sector" : null}
                    onAction={canManage ? () => setShowForm(true) : null}
                />
            ) : (
                <div className="kpi-sectors-grid">
                    {filteredSectors.map(sector => (
                        <SectorCard 
                            key={sector.id}
                            sector={sector}
                            onEdit={() => setEditingSector(sector)}
                            onDelete={() => setDeletingSector(sector)}
                            canManage={canManage}
                        />
                    ))}
                </div>
            )}
            
            {showForm && (
                <SectorForm 
                    onSubmit={async (data) => {
                        await onCreate(data);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}
            
            {editingSector && (
                <SectorForm 
                    sector={editingSector}
                    onSubmit={async (data) => {
                        await onUpdate(editingSector.id, data);
                        setEditingSector(null);
                    }}
                    onCancel={() => setEditingSector(null)}
                />
            )}
            
            {deletingSector && (
                <SectorDeleteConfirm 
                    sector={deletingSector}
                    onConfirm={async () => {
                        await onDelete(deletingSector.id);
                        setDeletingSector(null);
                    }}
                    onCancel={() => setDeletingSector(null)}
                />
            )}
        </div>
    );
};

export default SectorList;